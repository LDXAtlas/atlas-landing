/* Atlas Network helpers: dates, next gathering, small render helpers. Reads window.ATLAS_NETWORK from gatherings.js. */
(function () {
  var N = window.ATLAS_NETWORK || { gatherings: [] };
  var TZ = "America/New_York";

  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function nyNow() {
    var o = {};
    new Intl.DateTimeFormat("en-US", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hour12: false })
      .formatToParts(new Date()).forEach(function (x) { o[x.type] = x.value; });
    return { iso: o.year + "-" + o.month + "-" + o.day, mins: (+o.hour % 24) * 60 + +o.minute };
  }
  function endMins(g) { var t = (g.time && g.time.end) || N.defaultTime.end; return +t.slice(0, 2) * 60 + +t.slice(3, 5); }
  function status(g) {
    var now = nyNow();
    if (g.date < now.iso) return "past";
    if (g.date === now.iso) return now.mins >= endMins(g) ? "past" : "today";
    return "upcoming";
  }
  function d(iso) { return new Date(iso + "T12:00:00Z"); }
  function fmt(iso, opts) { opts = opts || { weekday: "long", month: "long", day: "numeric" }; opts.timeZone = "UTC"; return d(iso).toLocaleDateString("en-US", opts); }
  function thirdThursday(y, m) { var first = (4 - new Date(Date.UTC(y, m, 1)).getUTCDay() + 7) % 7 + 1; return first + 14; }

  var list = (N.gatherings || []).filter(function (g) { return g && g.date && !g.cancelled; })
    .sort(function (a, b) { return a.date < b.date ? -1 : 1; });

  /* If nothing is scheduled, fall back to the next third Thursday so the RSVP link never breaks.
     Any date that appears in gatherings.js (including cancelled ones) is never generated here. */
  var listed = {};
  (N.gatherings || []).forEach(function (g) { if (g && g.date) listed[g.date] = true; });
  function fallbackAfter(afterIso) {
    var now = nyNow(), from = afterIso && afterIso > now.iso ? afterIso : now.iso;
    var y = +from.slice(0, 4), m = +from.slice(5, 7) - 1;
    for (var i = 0; i < 6; i++) {
      var iso = y + "-" + pad(m + 1) + "-" + pad(thirdThursday(y, m));
      var g = { date: iso, title: "The " + fmt(iso, { month: "long" }) + " Table Gathering", generated: true,
        summary: "One church shares what's working, we work through a real staff problem together, and we pray for each other's churches.",
        agenda: [
          { min: 8, title: "Gather", text: "Quick hellos and one win from the last month." },
          { min: 10, title: "One thing that's working", text: "One church shares a system, habit or tool that's helping their staff right now." },
          { min: 17, title: "The table", text: "We help one church think through a real problem together." },
          { min: 7, title: "Pray", text: "We close by praying for each other's churches by name." },
          { min: 3, title: "Go", text: "The next date, and one thing to try before then." }
        ] };
      if (!listed[iso] && status(g) !== "past" && (!afterIso || iso > afterIso)) return g;
      m++; if (m > 11) { m = 0; y++; }
    }
    return null;
  }
  function to12(hhmm) { var h = +hhmm.slice(0, 2), mi = hhmm.slice(3, 5); return ((h + 11) % 12 + 1) + ":" + mi + (h < 12 ? " am" : " pm"); }

  var api = {
    data: N,
    all: list,
    status: status,
    fmt: fmt,
    timeLabel: function (g) {
      var t = g.time || {};
      if (t.label) return t.label;
      if (t.start || t.end) return to12(t.start || N.defaultTime.start).replace(/ [ap]m$/, "") + " to " + to12(t.end || N.defaultTime.end) + " Eastern";
      return N.defaultTime.label;
    },
    startLabel: function (g) { return to12((g.time && g.time.start) || N.defaultTime.start) + " Eastern"; },
    upcoming: function () { return list.filter(function (g) { return status(g) !== "past"; }); },
    past: function () { return list.filter(function (g) { return status(g) === "past"; }).reverse(); },
    next: function () { var u = api.upcoming(); return u.length ? u[0] : fallbackAfter(null); },
    /* The gathering after this one (used to point late RSVPs at the next call). */
    after: function (g) { for (var i = 0; i < list.length; i++) if (list[i].date > g.date && status(list[i]) !== "past") return list[i]; return fallbackAfter(g.date); },
    find: function (iso) { for (var i = 0; i < list.length; i++) if (list[i].date === iso) return list[i]; return null; },
    url: function (g) { return "/network/table/" + g.date; },
    cal: function (g, cls) {
      return '<span class="cal' + (cls ? " " + cls : "") + '" aria-hidden="true"><b>' + fmt(g.date, { month: "short" }) + "</b><span>" +
        fmt(g.date, { day: "numeric" }) + "</span><small>" + fmt(g.date, { weekday: "short" }) + "</small></span>";
    },
    esc: function (s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); },
    startsAt: function (g) { return nyInstant(g.date, (g.time && g.time.start) || N.defaultTime.start); },
    endsAt: function (g) { return nyInstant(g.date, (g.time && g.time.end) || N.defaultTime.end); },
    countdown: countdown
  };

  /* The exact moment (ms since epoch) for a wall-clock time in New York, handling daylight saving. */
  function nyInstant(iso, hhmm) {
    var y = +iso.slice(0, 4), mo = +iso.slice(5, 7) - 1, da = +iso.slice(8, 10), h = +hhmm.slice(0, 2), mi = +hhmm.slice(3, 5);
    var guess = Date.UTC(y, mo, da, h, mi);
    for (var i = 0; i < 2; i++) {
      var o = {};
      new Intl.DateTimeFormat("en-US", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hour12: false })
        .formatToParts(new Date(guess)).forEach(function (x) { o[x.type] = x.value; });
      var wall = Date.UTC(+o.year, +o.month - 1, +o.day, +o.hour % 24, +o.minute);
      guess += Date.UTC(y, mo, da, h, mi) - wall;
    }
    return guess;
  }

  /* Live countdown to a gathering. Renders into `el`; switches to "happening now" during the call
     and calls onEnd() once it's over (pages use that to move on to the next gathering). */
  function countdown(el, g, opts) {
    opts = opts || {};
    var start = api.startsAt(g), end = api.endsAt(g), timer;
    var label = opts.label || "The next Table Gathering starts in";
    var still = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var UNITS = [["days", "days"], ["hours", "hrs"], ["minutes", "min"], ["seconds", "sec"]];
    el.innerHTML =
      '<div class="cd-head" aria-hidden="true"><span class="cd-label">' + api.esc(label) + '</span></div>' +
      '<div class="cd-units" aria-hidden="true">' +
      UNITS.map(function (u, i) {
        return '<div class="pad pad-' + i + '" data-u="' + u[0] + '"><div class="pad-stack"></div><div class="note"><b>--</b></div><span class="pad-name">' + u[1] + "</span></div>";
      }).join("") + "</div>" +
      '<div class="cd-live" role="status" hidden><i aria-hidden="true"></i><span>Happening now. Join from your calendar invite.</span></div>' +
      '<span class="sr-only" data-sr></span>';
    el.hidden = false;
    var pads = {}, vals = {}, units = el.querySelector(".cd-units"), live = el.querySelector(".cd-live"), sr = el.querySelector("[data-sr]"), lastSr = -1;
    el.querySelectorAll("[data-u]").forEach(function (n) { pads[n.getAttribute("data-u")] = n; });
    function two(n) { return (n < 10 ? "0" : "") + n; }

    /* Tear off the top sticky note to reveal the next number underneath. */
    function setPad(u, v) {
      if (vals[u] === v) return;
      var pad = pads[u], top = pad.querySelector(".note:not(.peel)");
      if (vals[u] === undefined || still || document.hidden) { top.firstChild.textContent = v; vals[u] = v; return; }
      vals[u] = v;
      var fresh = document.createElement("div");
      fresh.className = "note"; fresh.innerHTML = "<b></b>"; fresh.firstChild.textContent = v;
      pad.insertBefore(fresh, top);           // new note sits under the old one
      top.style.setProperty("--fall", (Math.random() * 16 - 8).toFixed(1) + "deg");
      top.classList.add("peel");              // old note peels off and drops away
      setTimeout(function () { if (top.parentNode) top.parentNode.removeChild(top); }, 900);
    }
    function tick() {
      var now = Date.now();
      if (now >= end) { clearInterval(timer); if (opts.onEnd) opts.onEnd(); else el.hidden = true; return; }
      if (now >= start) { units.hidden = true; el.querySelector(".cd-head").hidden = true; live.hidden = false; el.classList.add("is-live"); sr.textContent = ""; return; }
      var s = Math.floor((start - now) / 1000);
      var d = Math.floor(s / 86400), h = Math.floor(s % 86400 / 3600), m = Math.floor(s % 3600 / 60), sec = s % 60;
      setPad("days", String(d)); setPad("hours", two(h)); setPad("minutes", two(m)); setPad("seconds", two(sec));
      // Screen readers get a calm update once a minute, not every second.
      if (m !== lastSr) { lastSr = m; sr.textContent = label + " " + d + " days, " + h + " hours, " + m + " minutes."; }
    }
    tick();
    timer = setInterval(tick, 1000);
    return { stop: function () { clearInterval(timer); } };
  }

  window.AtlasNetwork = api;
})();
