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

  /* If nothing is scheduled yet, fall back to the next third Thursday so the RSVP link never breaks. */
  function fallback() {
    var now = nyNow(), y = +now.iso.slice(0, 4), m = +now.iso.slice(5, 7) - 1;
    for (var i = 0; i < 3; i++) {
      var g = { date: y + "-" + pad(m + 1) + "-" + pad(thirdThursday(y, m)), title: "This month's Table Gathering", generated: true,
        summary: "One church shares what's working, we work through a real staff problem together, and we pray for each other's churches.",
        agenda: [
          { min: 8, title: "Gather", text: "Quick hellos and one win from the last month." },
          { min: 10, title: "One thing that's working", text: "One church shares a system, habit or tool that's helping their staff right now." },
          { min: 17, title: "The table", text: "We help one church think through a real problem together." },
          { min: 7, title: "Pray", text: "We close by praying for each other's churches by name." },
          { min: 3, title: "Go", text: "The next date, and one thing to try before then." }
        ] };
      if (status(g) !== "past") return g;
      m++; if (m > 11) { m = 0; y++; }
    }
  }

  var api = {
    data: N,
    all: list,
    status: status,
    fmt: fmt,
    timeLabel: function (g) { return (g.time && g.time.label) || N.defaultTime.label; },
    upcoming: function () { return list.filter(function (g) { return status(g) !== "past"; }); },
    past: function () { return list.filter(function (g) { return status(g) === "past"; }).reverse(); },
    next: function () { var u = api.upcoming(); return u.length ? u[0] : fallback(); },
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
    el.innerHTML =
      '<div class="cd-head"><span class="cd-label">' + api.esc(label) + '</span></div>' +
      '<div class="cd-units" role="timer" aria-live="off">' +
      ['days', 'hours', 'minutes', 'seconds'].map(function (u) {
        return '<div class="cd-unit"><span class="cd-num" data-u="' + u + '">--</span><span class="cd-name">' + u + "</span></div>";
      }).join("") + "</div>" +
      '<div class="cd-live" hidden><i aria-hidden="true"></i><span>Happening now. Join from your calendar invite.</span></div>' +
      '<span class="sr-only" data-sr></span>';
    el.hidden = false;
    var nums = {}, units = el.querySelector(".cd-units"), live = el.querySelector(".cd-live"), sr = el.querySelector("[data-sr]"), lastSr = -1;
    el.querySelectorAll("[data-u]").forEach(function (n) { nums[n.getAttribute("data-u")] = n; });
    function two(n) { return (n < 10 ? "0" : "") + n; }
    function tick() {
      var now = Date.now();
      if (now >= end) { clearInterval(timer); if (opts.onEnd) opts.onEnd(); else el.hidden = true; return; }
      if (now >= start) { units.hidden = true; el.querySelector(".cd-head").hidden = true; live.hidden = false; el.classList.add("is-live"); sr.textContent = ""; return; }
      var s = Math.floor((start - now) / 1000);
      var d = Math.floor(s / 86400), h = Math.floor(s % 86400 / 3600), m = Math.floor(s % 3600 / 60), sec = s % 60;
      nums.days.textContent = d; nums.hours.textContent = two(h); nums.minutes.textContent = two(m); nums.seconds.textContent = two(sec);
      // Screen readers get a calm update once a minute, not every second.
      if (m !== lastSr) { lastSr = m; sr.textContent = label + " " + d + " days, " + h + " hours, " + m + " minutes."; }
    }
    tick();
    timer = setInterval(tick, 1000);
    return { stop: function () { clearInterval(timer); } };
  }

  window.AtlasNetwork = api;
})();
