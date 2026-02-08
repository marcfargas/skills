#!/usr/bin/env node

import { execFileSync } from "child_process";
import { readFileSync, unlinkSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";
import { randomBytes } from "crypto";
import { Readability } from "@mozilla/readability";
import { JSDOM } from "jsdom";
import TurndownService from "turndown";
import { gfm } from "turndown-plugin-gfm";

const args = process.argv.slice(2);

// Parse --content flag
const contentIndex = args.indexOf("--content");
const fetchContent = contentIndex !== -1;
if (fetchContent) args.splice(contentIndex, 1);

// Parse --news flag
const newsIndex = args.indexOf("--news");
const isNews = newsIndex !== -1;
if (isNews) args.splice(newsIndex, 1);

// Parse -n <num>
let numResults = 5;
const nIndex = args.indexOf("-n");
if (nIndex !== -1 && args[nIndex + 1]) {
	numResults = parseInt(args[nIndex + 1], 10);
	args.splice(nIndex, 2);
}

// Parse -r <region>
let region = null;
const rIndex = args.indexOf("-r");
if (rIndex !== -1 && args[rIndex + 1]) {
	region = args[rIndex + 1];
	args.splice(rIndex, 2);
}

// Parse -t <timelimit>
let timelimit = null;
const tIndex = args.indexOf("-t");
if (tIndex !== -1 && args[tIndex + 1]) {
	timelimit = args[tIndex + 1];
	args.splice(tIndex, 2);
}

// Parse -b <backend>
let backend = null;
const bIndex = args.indexOf("-b");
if (bIndex !== -1 && args[bIndex + 1]) {
	backend = args[bIndex + 1];
	args.splice(bIndex, 2);
}

const query = args.join(" ");

if (!query) {
	console.log("Usage: search.js [--news] <query> [-n <num>] [--content] [-r <region>] [-t <timelimit>] [-b <backend>]");
	console.log("\nOptions:");
	console.log("  --news                News search instead of web search");
	console.log("  -n <num>              Number of results (default: 5)");
	console.log("  --content             Fetch readable content as markdown");
	console.log("  -r <region>           Region: us-en, es-es, de-de, fr-fr, etc.");
	console.log("  -t <timelimit>        Time filter: d (day), w (week), m (month), y (year)");
	console.log("  -b <backend>          Backend: auto, all, bing, brave, duckduckgo, google, etc.");
	console.log("\nExamples:");
	console.log('  search.js "javascript async await"');
	console.log('  search.js "rust programming" -n 10');
	console.log('  search.js "climate change" --content');
	console.log('  search.js --news "AI agents" -t w');
	process.exit(1);
}

function htmlToMarkdown(html) {
	const turndown = new TurndownService({ headingStyle: "atx", codeBlockStyle: "fenced" });
	turndown.use(gfm);
	turndown.addRule("removeEmptyLinks", {
		filter: (node) => node.nodeName === "A" && !node.textContent?.trim(),
		replacement: () => "",
	});
	return turndown
		.turndown(html)
		.replace(/\[\\?\[\s*\\?\]\]\([^)]*\)/g, "")
		.replace(/ +/g, " ")
		.replace(/\s+,/g, ",")
		.replace(/\s+\./g, ".")
		.replace(/\n{3,}/g, "\n\n")
		.trim();
}

async function fetchPageContent(url) {
	try {
		const response = await fetch(url, {
			headers: {
				"User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
				"Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
			},
			signal: AbortSignal.timeout(10000),
		});

		if (!response.ok) {
			return `(HTTP ${response.status})`;
		}

		const html = await response.text();
		const dom = new JSDOM(html, { url });
		const reader = new Readability(dom.window.document);
		const article = reader.parse();

		if (article && article.content) {
			return htmlToMarkdown(article.content).substring(0, 5000);
		}

		// Fallback: try to get main content
		const fallbackDoc = new JSDOM(html, { url });
		const body = fallbackDoc.window.document;
		body.querySelectorAll("script, style, noscript, nav, header, footer, aside").forEach((el) => el.remove());
		const main = body.querySelector("main, article, [role='main'], .content, #content") || body.body;
		const text = main?.textContent || "";

		if (text.trim().length > 100) {
			return text.trim().substring(0, 5000);
		}

		return "(Could not extract content)";
	} catch (e) {
		return `(Error: ${e.message})`;
	}
}

function runDdgs(query, numResults, isNews, region, timelimit, backend) {
	const tmpFile = join(tmpdir(), `ddgs-${randomBytes(6).toString("hex")}.json`);
	const subcommand = isNews ? "news" : "text";

	const ddgsArgs = [subcommand, "-q", query, "-m", String(numResults), "-o", tmpFile];

	if (region) {
		ddgsArgs.push("-r", region);
	}
	if (timelimit) {
		ddgsArgs.push("-t", timelimit);
	}
	if (backend) {
		ddgsArgs.push("-b", backend);
	}

	try {
		execFileSync("ddgs", ddgsArgs, {
			stdio: ["pipe", "pipe", "pipe"],
			timeout: 30000,
		});
	} catch (e) {
		// ddgs may write output to file even if it exits with error
		// (e.g. "Aborted!" after printing results)
	}

	try {
		const raw = readFileSync(tmpFile, "utf-8");
		unlinkSync(tmpFile);
		return JSON.parse(raw);
	} catch {
		try {
			unlinkSync(tmpFile);
		} catch {}
		throw new Error("ddgs produced no results. Is ddgs installed? Run: uv tool install ddgs");
	}
}

// Main
try {
	const rawResults = runDdgs(query, numResults, isNews, region, timelimit, backend);

	if (!rawResults || rawResults.length === 0) {
		console.error("No results found.");
		process.exit(0);
	}

	// Normalize results to a common shape
	const results = rawResults.map((r) => ({
		title: r.title || "",
		link: r.href || r.url || "",
		snippet: r.body || "",
		date: r.date || "",
		source: r.source || "",
	}));

	if (fetchContent) {
		for (const result of results) {
			result.content = await fetchPageContent(result.link);
		}
	}

	for (let i = 0; i < results.length; i++) {
		const r = results[i];
		console.log(`--- Result ${i + 1} ---`);
		console.log(`Title: ${r.title}`);
		console.log(`Link: ${r.link}`);
		if (r.date) {
			console.log(`Date: ${r.date}`);
		}
		if (r.source) {
			console.log(`Source: ${r.source}`);
		}
		console.log(`Snippet: ${r.snippet}`);
		if (r.content) {
			console.log(`Content:\n${r.content}`);
		}
		console.log("");
	}
} catch (e) {
	console.error(`Error: ${e.message}`);
	process.exit(1);
}
