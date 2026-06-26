/*
  Model for To-Do List (6 fields)
  Generated at 6/25/2026, 12:12:00 AM
  Powered by evolutility-models v.0.3.0 - https://github.com/evoluteur/evolutility-models
*/

import type { ModelDB } from "../types.ts";

export const todo = {
  id: "todo",
  title: "To-Do List",
  world: "organizer",
  name: "task",
  namePlural: "tasks",
  pKey: "id",
  table: "task",
  active: true,
  titleField: "title",
  fields: [
    {
      id: "title",
      type: "text",
      label: "Title",
      required: true,
      maxLength: 255,
      inMany: true,
      column: "title",
      inSearch: true,
    },
    {
      id: "duedate",
      type: "date",
      label: "Due date",
      inMany: true,
      column: "duedate",
    },
    {
      id: "category",
      type: "lov",
      label: "Category",
      list: [
        {
          id: 1,
          text: "Personal",
        },
        {
          id: 2,
          text: "Work",
        },
        {
          id: 3,
          text: "Projects",
        },
        {
          id: 4,
          text: "Goals",
        },
        {
          id: 5,
          text: "Fun",
        },
        {
          id: 6,
          text: "Others",
        },
        {
          id: 7,
          text: "Misc.",
        },
      ],
      lovIcon: false,
      inMany: true,
      column: "category_id",
      lovTable: "task_category",
    },
    {
      id: "priority",
      type: "lov",
      label: "Priority",
      required: true,
      list: [
        {
          id: 1,
          text: "1 - ASAP",
        },
        {
          id: 2,
          text: "2 - Urgent",
        },
        {
          id: 3,
          text: "3 - Important",
        },
        {
          id: 4,
          text: "4 - Medium",
        },
        {
          id: 5,
          text: "5 - Low",
        },
      ],
      lovIcon: false,
      defaultValue: 4,
      inMany: true,
      column: "priority_id",
      lovTable: "task_priority",
    },
    {
      id: "complete",
      type: "boolean",
      label: "Complete",
      inMany: true,
      column: "complete",
    },
    {
      id: "description",
      type: "textmultiline",
      label: "Description",
      maxLength: 1000,
      inMany: false,
      column: "description",
      inSearch: true,
    },
  ],
  collections: [],
  noStats: true,
} satisfies ModelDB;
