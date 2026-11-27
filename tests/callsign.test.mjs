import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { runInNewContext } from "node:vm";

const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");
const script = html.match(/<script>([\s\S]*?)<\/script>/)[1];

function element() {
  const listeners = new Map();
  const el = {
    value: "", textContent: "", children: [],
    style: { setProperty() {}, removeProperty() {} },
    classList: { add() {}, remove() {}, toggle() {} },
    setAttribute() {}, removeAttribute() {}, focus() {},
    addEventListener: (type, handle) => listeners.set(type, handle),
    click: () => listeners.get("click")?.(),
    appendChild: child => el.children.push(child),
    replaceChildren: () => { el.children = []; },
    get firstElementChild() { return el.children[0]; },
    set innerHTML(value) { el.markup = value; el.children = []; }
  };
  return el;
}

function backend() {
  const teams = new Map();
  const posts = [];
  let nextSession = 0;
  return {
    teams, posts,
    async fetch(url, options) {
      if (options.method === "POST") {
        const event = JSON.parse(options.body);
        posts.push(event);
        const team = event.team_id;
        const current = teams.get(team);
        if (event.event_type === "MOBILE" && current?.status !== "active") {
          teams.set(team, { status: "active", session_id: "job-" + ++nextSession, timeline: { MOBILE: event } });
        } else if (current?.status === "active" && event.session_id === current.session_id) {
          if (event.event_type === "CLEAR") teams.set(team, { status: "cleared", last_event_time: event.event_time });
          else current.timeline[event.event_type] = event;
        }
        return {};
      }
      const params = new URL(url).searchParams;
      const data = params.get("action") === "organisationConfig"
        ? { status: "ok", organisations: [{ name: "Magpas", output_url: "https://docs.google.com/spreadsheets/d/example/edit" }] }
        : teams.get(params.get("team_id")) || { status: "none" };
      return { json: async () => structuredClone(data) };
    }
  };
}

function device(server, storage = new Map([["timestamp_organisation", "Magpas"]])) {
  const elements = new Map();
  const get = id => {
    if (!elements.has(id)) elements.set(id, element());
    return elements.get(id);
  };
  const navigator = { onLine: true };
  const context = {
    document: { getElementById: get, createElement: element, addEventListener() {} },
    window: { addEventListener() {} },
    navigator, confirm: () => true,
    localStorage: {
      getItem: key => storage.get(key) ?? null,
      setItem: (key, value) => storage.set(key, value),
      removeItem: key => storage.delete(key)
    },
    setInterval() {},
    fetch: (...args) => server.fetch(...args)
  };
  const api = runInNewContext(script + "\n({ pullActiveEpisode, syncPending, pheaCountdownAt, handleVoiceTranscript, handoverConfig, handoverPeriodAt, state });", context);
  const timeline = label => get("topTimelineGrid").children.find(button => button.markup.includes(">" + label + "<"));
  return {
    ...api, get, navigator, storage, timeline,
    select(label) {
      get("callsignButton").click();
      assert.equal(get("modalTitle").textContent, "Select callsign");
      return get("modalList").children.find(button => button.textContent.startsWith(label)).click();
    },
    session: () => storage.get("timestamp_session_id"),
    async clear() {
      await get("clearButton").click();
      if (!get("phoneClearConfirm").hidden) await get("phoneClearAccept").click();
    },
    pending: () => JSON.parse(storage.get("timestamp_pending_queue") || "[]")
  };
}

test("one Mobile starts the shared job; either device can add events or clear it", async () => {
  const server = backend();
  const first = device(server);
  const second = device(server);
  assert.equal(first.get("callsignButton").textContent, "Select callsign");
  await first.timeline("Mobile").click();
  assert.equal(first.get("modalBackdrop").style.display, "flex");
  await first.get("modalClose").click();
  assert.equal(server.posts.length, 0);
  await first.select("HM66");
  await second.select("HM66");
  assert.equal(first.get("callsignButton").textContent, "HM66");
  assert.equal(first.storage.get("timestamp_user"), "Helimed66");
  await second.timeline("With Patient").click();
  assert.deepEqual(server.posts, []);
  await first.timeline("Mobile").click();
  await second.pullActiveEpisode();
  assert.equal(second.session(), first.session());
  await second.timeline("Mobile").click();
  await second.timeline("With Patient").click();
  await second.get("pheaButton").click();
  await second.get("pheaButton").click();
  await first.pullActiveEpisode();
  assert.equal(first.storage.get("timestamp_scene_start"), server.posts[1].event_time);
  assert.deepEqual(server.posts.map(event => event.event_type), ["MOBILE", "WITH_PATIENT", "PHEA"]);
  assert.equal(first.pheaCountdownAt(server.posts[2].event_time, Date.parse(server.posts[2].event_time) + 46000).elapsed, 46);
  await second.clear();
  await first.pullActiveEpisode();
  for (const member of [first, second]) {
    assert.equal(member.session(), undefined);
    assert.equal(member.get("callsignButton").textContent, "HM66");
    assert.equal(member.storage.has("timestamp_scene_start"), false);
    assert.equal(member.get("pheaDetail").textContent, "Record PHEA drugs");
  }
  assert.equal(device(server, first.storage).get("callsignButton").textContent, "HM66");
  await first.timeline("Mobile").click();
  assert.equal(first.session(), "job-2");
});

test("joining an active team only pulls; it blocks logging while the pull is in flight", async () => {
  const server = backend();
  const first = device(server);
  await first.select("M33");
  await first.timeline("Mobile").click();
  const second = device(server);
  const fetch = server.fetch;
  let resume;
  server.fetch = (url, options) => new URL(url).searchParams.get("action") === "activeEpisode"
    ? new Promise(resolve => { resume = () => resolve(fetch(url, options)); }) : fetch(url, options);
  const joining = second.select("M33");
  assert.equal(second.get("callsignButton").textContent, "M33");
  await second.timeline("With Patient").click();
  await second.timeline("Mobile").click();
  assert.deepEqual(server.posts.map(event => event.event_type), ["MOBILE"]);
  resume();
  await joining;
  assert.equal(second.session(), first.session());
  await second.select("CC01");
  assert.equal(second.get("callsignButton").textContent, "M33");
  assert.equal(server.posts.length, 1);
});

test("switching rechecks the current team and rejects locally queued work", async () => {
  const server = backend();
  const deviceA = device(server);
  const deviceB = device(server);
  await deviceA.select("HM66");
  await deviceB.select("HM66");
  await deviceB.timeline("Mobile").click();
  assert.equal(deviceA.session(), undefined);
  await deviceA.select("CC01");
  assert.equal(deviceA.session(), deviceB.session());
  assert.equal(deviceA.get("callsignButton").textContent, "HM66");
  deviceA.navigator.onLine = false;
  await deviceA.timeline("With Patient").click();
  assert.equal(deviceA.pending()[0].session_id, deviceB.session());
  await deviceB.clear();
  deviceA.navigator.onLine = true;
  await deviceA.select("CC01");
  assert.equal(deviceA.get("callsignButton").textContent, "HM66");
  assert.equal(deviceA.pending().length, 1);
});

test("idle assignment can change, including to a personal callsign; offline Mobile waits", async () => {
  const server = backend();
  const member = device(server);
  await member.select("CC01");
  member.navigator.onLine = false;
  await member.timeline("Mobile").click();
  await member.select("M33");
  assert.equal(member.get("callsignButton").textContent, "CC01");
  assert.deepEqual(server.posts, []);
  member.navigator.onLine = true;
  await member.select("M33");
  member.storage.set("timestamp_personal_callsign", "Pilot 1");
  await member.select("Personal");
  assert.equal(member.get("callsignButton").textContent, "Pilot 1");
  assert.equal(member.storage.get("timestamp_user"), "Pilot 1");
});

test("a late poll for the previous callsign cannot populate the new team", async () => {
  const server = backend();
  const member = device(server);
  await member.select("HM66");
  const fetch = server.fetch;
  let resume;
  server.fetch = (url, options) => new Promise(resolve => { resume = resolve; });
  const poll = member.pullActiveEpisode();
  server.fetch = fetch;
  await member.select("M33");
  resume({ json: async () => ({ status: "active", session_id: "old-team-job", timeline: {} }) });
  await poll;
  assert.equal(member.get("callsignButton").textContent, "M33");
  assert.equal(member.session(), undefined);
});

test("pending Clear keeps the callsign and blocks both switching and Mobile", async () => {
  const server = backend();
  const member = device(server);
  await member.select("HM66");
  await member.timeline("Mobile").click();
  const oldSession = member.session();
  const fetch = server.fetch;
  server.fetch = (url, options) => {
    if (options.method === "POST" && JSON.parse(options.body).event_type === "CLEAR") return {};
    return fetch(url, options);
  };
  await member.clear();
  await member.select("CC01");
  await member.timeline("Mobile").click();
  assert.equal(member.session(), undefined);
  assert.equal(member.get("callsignButton").textContent, "HM66");
  assert.equal(member.pending()[0].event_type, "CLEAR");
  assert.equal(server.teams.get("Helimed66").session_id, oldSession);
  assert.equal(server.posts.length, 1);
  server.fetch = fetch;
  await member.clear();
  assert.deepEqual(member.pending(), []);
  await member.select("CC01");
  assert.equal(member.get("callsignButton").textContent, "CC01");
});

test("Clear requires explicit confirmation tied to the displayed session", async () => {
  const server = backend();
  const member = device(server);
  await member.select("HM66");
  await member.timeline("Mobile").click();
  await member.get("clearButton").click();
  assert.equal(member.get("phoneClearConfirm").hidden, false);
  assert.equal(server.posts.length, 1);
  await member.get("phoneClearCancel").click();
  assert.equal(member.get("phoneClearConfirm").hidden, true);
  assert.equal(server.posts.length, 1);
  await member.get("clearButton").click();
  server.teams.set("Helimed66",{status:"active",session_id:"different-job",timeline:{}});
  await member.pullActiveEpisode();
  await member.get("phoneClearAccept").click();
  assert.equal(member.session(),"different-job");
  assert.equal(server.posts.length,1);
  await member.clear();
  assert.equal(server.posts.at(-1).event_type,"CLEAR");
  assert.equal(server.posts.at(-1).session_id,"different-job");
});

test("voice dose restarts the shared ROC countdown and applies the colour thresholds", async () => {
  const server = backend();
  const member = device(server);
  const teammate = device(server);
  await member.select("HM66");
  await teammate.select("HM66");
  await member.timeline("Mobile").click();
  await member.get("pheaButton").click();
  member.state.voiceEpisode = member.session();
  await member.handleVoiceTranscript("ROC.");
  const dose = server.posts.at(-1);
  assert.equal(dose.event_type,"ROCURONIUM");
  await teammate.pullActiveEpisode();
  assert.equal(teammate.get("pheaDetail").textContent,`Rocuronium at ${dose.event_time_local}`);
  const since = Date.parse(dose.event_time);
  for (const [seconds, color] of [[0,"green"],[1799,"green"],[1800,"amber"],[2399,"amber"],[2400,"red"],[2700,"green"]]) {
    assert.equal(member.pheaCountdownAt(dose.event_time,since+1000*seconds,true).color,color);
  }
  assert.equal(member.pheaCountdownAt(dose.event_time,since+60000).remaining,2700);
  assert.equal(member.pheaCountdownAt(dose.event_time,since+60000).color,"green");
});

test("unassigned Mobile opens the picker and only starts an idle team", async () => {
  const server = backend();
  const starter = device(server);
  const joiner = device(server);
  for (const member of [starter,joiner]) {
    await member.timeline("Mobile").click();
    assert.equal(member.get("modalBackdrop").style.display,"flex");
    await member.get("modalList").children.find(button => button.textContent === "HM66").click();
    assert.equal(member.get("callsignButton").textContent,"HM66");
    assert.equal(member.session(),"job-1");
  }
  assert.deepEqual(server.posts.map(event => event.event_type),["MOBILE"]);
});

test("handover confirms once per device per shift and survives Clear", async () => {
  const server=backend(), member=device(server);
  await member.select("HM66");
  member.storage.set("timestamp_handover_confirmed","previous-shift");
  await member.timeline("Mobile").click();
  assert.equal(member.get("modalTitle").textContent,"Shift handover · confirm callsign");
  assert.equal(server.posts.length,0);
  await member.get("modalClose").click();
  assert.equal(server.posts.length,0);
  await member.timeline("Mobile").click();
  await member.get("modalList").children.find(b=>b.textContent.startsWith("HM66")).click();
  assert.equal(server.posts.length,1);
  await member.clear();
  await member.timeline("Mobile").click();
  assert.equal(server.posts.filter(p=>p.event_type==="MOBILE").length,2);
});
test("handover periods use organisation time zone, including summer time", () => {
  const member=device(backend()), cfg=member.handoverConfig("Magpas");
  assert.equal(member.handoverPeriodAt(cfg,new Date("2026-11-27T06:59:00Z")),"2026-11-26T19:00");
  assert.equal(member.handoverPeriodAt(cfg,new Date("2026-11-27T07:00:00Z")),"2026-11-27T07:00");
  assert.equal(member.handoverPeriodAt(cfg,new Date("2026-07-01T06:00:00Z")),"2026-07-01T07:00");
  assert.equal(member.handoverPeriodAt(member.handoverConfig("DSAA"),new Date()),"");
  assert.equal(member.handoverPeriodAt(member.handoverConfig("DSAA",{timezone:"Europe/London",times:["08:30"]}),new Date("2026-11-27T09:00:00Z")),"2026-11-27T08:30");
});