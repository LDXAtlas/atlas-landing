/* ============================================================
   ATLAS NETWORK · GATHERINGS
   The one file to edit. Every Network page reads from this list:
     /network                    hub (next gathering, upcoming, past)
     /network/table              always the NEXT gathering + RSVP
     /network/table/2026-11-19   one gathering's page (recap once it's happened)

   To add a gathering: copy an entry, change the date and words. That's it.
   To cancel one: delete it, or set  cancelled: true.
   Dates are Eastern time. Default time is 7:00 to 7:45 pm.
   Prayer requests are never written here (prayer is for churches, never about them).
   ============================================================ */
window.ATLAS_NETWORK = {
  series: "The Table",
  defaultTime: { start: "19:00", end: "19:45", label: "7:00 to 7:45 pm Eastern" },
  where: "Google Meet",
  hosts: "Josiah, with Lucas and Ben from Atlas",

  gatherings: [
    {
      date: "2026-11-19",
      title: "The first gathering",
      summary: "Meet the table. Hear why we're starting this, see what one church is doing that works, and work through a real staff problem together.",
      sharing: null, // e.g. { name: "Pastor Name", church: "Church Name", topic: "How we run our weekly staff meeting" }
      agenda: [
        { min: 6,  title: "Gather", text: "Quick hellos. Who you are, where you serve, one thing on your plate this week." },
        { min: 8,  title: "Why this table exists", text: "A few minutes on why we're hosting this and what we hope it becomes. First gathering only." },
        { min: 8,  title: "One thing that's working", text: "One church shares a system, habit or tool that's helping their staff right now." },
        { min: 14, title: "The table", text: "We help one church think through a real problem together. Everyone leaves with an idea." },
        { min: 6,  title: "Pray", text: "We close by praying for each other's churches by name." },
        { min: 3,  title: "Go", text: "The next date, and one thing to try before then." }
      ],
      recap: null // after the call: { ideas: ["...", "..."], note: "..." }
    },
    {
      date: "2026-12-17",
      title: "The December table",
      summary: "Christmas week is close. Bring what's working, and what's not, as your team heads into the busiest services of the year.",
      sharing: null,
      agenda: [
        { min: 8,  title: "Gather", text: "Quick hellos and one win from the last month." },
        { min: 10, title: "One thing that's working", text: "One church shares a system, habit or tool that's helping their staff right now." },
        { min: 17, title: "The table", text: "We help one church think through a real problem together." },
        { min: 7,  title: "Pray", text: "We close by praying for each other's churches by name." },
        { min: 3,  title: "Go", text: "The next date, and one thing to try before then." }
      ],
      recap: null
    }
  ]
};
