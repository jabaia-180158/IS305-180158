"use strict";

/** Shared validation helpers used by the user and request classes. */

const capitalise = (text) => text.charAt(0).toUpperCase() + text.slice(1);

function cleanRequired(value, label) {
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(`${capitalise(label)} is required.`);
  }
  return value.trim();
}

function cleanFromList(value, list, label) {
  const text = cleanRequired(value, label);
  const match = list.find((item) => item.toLowerCase() === text.toLowerCase());
  if (!match) {
    throw new Error(`Unsupported ${label} "${text}". Allowed: ${list.join(", ")}.`);
  }
  return match;
}

function cleanTime(value, label) {
  const text = cleanRequired(value, label);
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(text)) {
    throw new Error(`${capitalise(label)} must use 24-hour HH:MM format (for example 08:30).`);
  }
  return text;
}

function cleanWholeNumber(value, label, min, max) {
  const text = String(value ?? "").trim();
  const number = Number(text);
  if (text === "" || !Number.isInteger(number) || number < min || number > max) {
    throw new Error(`${capitalise(label)} must be a whole number from ${min} to ${max}.`);
  }
  return number;
}

module.exports = { cleanRequired, cleanFromList, cleanTime, cleanWholeNumber };
