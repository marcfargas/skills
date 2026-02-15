#!/usr/bin/env node
/**
 * Generate .well-known/skills/index.json from SKILL.md files
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function parseArgs() {
  const args = process.argv.slice(2);
  const config = {
    skillsDir: '.',
    repository: null,
    output: '.well-known/skills/index.json'
  };
  
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--skills-dir' && i + 1 < args.length) {
      config.skillsDir = args[++i];
    } else if (args[i] === '--repository' && i + 1 < args.length) {
      config.repository = args[++i];
    } else if (args[i] === '--output' && i + 1 < args.length) {
      config.output = args[++i];
    }
  }
  
  return config;
}

function findSkillFiles(dir) {
  const results = [];
  
  function scan(currentDir) {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      
      if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
        scan(fullPath);
      } else if (entry.isFile() && entry.name === 'SKILL.md') {
        results.push(fullPath);
      }
    }
  }
  
  scan(dir);
  return results;
}

function extractFrontmatter(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  // Handle both Unix and Windows line endings
  const match = content.match(/^---[\r\n]+([\s\S]*?)[\r\n]+---/);
  
  if (!match) {
    return null;
  }
  
  const frontmatter = {};
  const lines = match[1].split(/\r?\n/);
  let currentKey = null;
  let multilineValue = [];
  let isMultiline = false;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Check if this is a key line (starts at column 0 with a colon)
    const colonIndex = line.indexOf(':');
    if (colonIndex !== -1 && !line.startsWith(' ') && !line.startsWith('\t')) {
      // Save previous multiline value if any
      if (currentKey && isMultiline) {
        frontmatter[currentKey] = multilineValue.join(' ').trim();
        multilineValue = [];
      }
      
      const key = line.slice(0, colonIndex).trim();
      let value = line.slice(colonIndex + 1).trim();
      
      // Check for multiline indicator (>- or >)
      if (value === '>-' || value === '>') {
        currentKey = key;
        isMultiline = true;
        multilineValue = [];
      } else {
        // Single line value
        // Remove quotes
        if ((value.startsWith('"') && value.endsWith('"')) || 
            (value.startsWith("'") && value.endsWith("'"))) {
          value = value.slice(1, -1);
        }
        frontmatter[key] = value;
        currentKey = null;
        isMultiline = false;
      }
    } else if (isMultiline && line.trim()) {
      // Continuation of multiline value
      multilineValue.push(line.trim());
    }
  }
  
  // Save final multiline value if any
  if (currentKey && isMultiline) {
    frontmatter[currentKey] = multilineValue.join(' ').trim();
  }
  
  return frontmatter;
}

function getRepositoryFromPackageJson() {
  try {
    const pkgPath = path.join(process.cwd(), 'package.json');
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
    
    if (typeof pkg.repository === 'string') {
      return pkg.repository;
    } else if (pkg.repository?.url) {
      return pkg.repository.url.replace(/^git\+/, '').replace(/\.git$/, '');
    }
  } catch (err) {
    // Ignore
  }
  return null;
}

function main() {
  const config = parseArgs();
  const skillsDir = path.resolve(config.skillsDir);
  
  if (!fs.existsSync(skillsDir)) {
    console.error(`❌ Skills directory not found: ${skillsDir}`);
    process.exit(1);
  }
  
  console.log(`📂 Scanning for skills in: ${skillsDir}`);
  const skillFiles = findSkillFiles(skillsDir);
  
  if (skillFiles.length === 0) {
    console.error('❌ No SKILL.md files found');
    process.exit(1);
  }
  
  console.log(`✅ Found ${skillFiles.length} skill(s)\n`);
  
  const skills = [];
  
  for (const filePath of skillFiles) {
    const frontmatter = extractFrontmatter(filePath);
    
    if (!frontmatter || !frontmatter.name || !frontmatter.description) {
      const relPath = path.relative(skillsDir, filePath);
      console.warn(`⚠️  Skipping ${relPath}: missing name or description frontmatter`);
      continue;
    }
    
    // Use forward slashes for web-friendly paths
    const relativePath = path.relative(skillsDir, path.dirname(filePath))
      .split(path.sep)
      .join('/');
    
    skills.push({
      name: frontmatter.name,
      description: frontmatter.description,
      path: relativePath || '.'
    });
    
    console.log(`  ✓ ${frontmatter.name} (${relativePath || 'root'})`);
  }
  
  const repository = config.repository || getRepositoryFromPackageJson();
  
  if (!repository) {
    console.warn('\n⚠️  Repository URL not found. Specify with --repository or add to package.json');
  }
  
  const index = {
    version: '1.0',
    repository,
    skills: skills.sort((a, b) => a.name.localeCompare(b.name))
  };
  
  const outputPath = path.resolve(config.output);
  const outputDir = path.dirname(outputPath);
  
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  fs.writeFileSync(outputPath, JSON.stringify(index, null, 2) + '\n');
  
  console.log(`\n✅ Generated: ${outputPath}`);
  console.log(`\n📋 Summary:`);
  console.log(`   Skills: ${skills.length}`);
  console.log(`   Repository: ${repository || '(not set)'}`);
}

main();
