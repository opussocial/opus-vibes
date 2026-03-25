import Database from "better-sqlite3";
const db = new Database("cms.db");
const types = db.prepare("SELECT name, slug FROM element_types").all();
console.log("Types:", JSON.stringify(types, null, 2));
const elements = db.prepare("SELECT name, slug FROM elements").all();
console.log("Elements:", JSON.stringify(elements, null, 2));
