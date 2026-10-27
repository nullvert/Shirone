---
title: "TOC Stress Test: Maximum Depth, Extreme Length & Edge Cases"
published: 2026-10-27
description: "A comprehensive stress test document for Table of Contents navigation, deep nesting, long heading wrapping, special characters, and scrollspy tracking."
tags: ["Test", "Debug", "TOC", "Typography"]
category: "Dev"
image: "/images/og.jpg"
alias: "toc-stress-test"
draft: false
---

This post is designed to thoroughly stress test the Table of Contents (TOC) component across indentation, scrolling, viewport overflows, scrollspy highlighting, and text truncation/wrapping.

<!-- more -->

## 1. Top Level Section: Deep Nesting Hierarchy

Here begins the exploration of deep hierarchical structures.

### 1.1 Second Tier: Subsystem Overview

Exploring second-tier indentation and active link tracking.

#### 1.1.1 Third Tier: Internal Architecture

Testing `h4` presentation within the TOC drawer and side panel.

##### 1.1.1.1 Fourth Tier: Low-Level Micro-Primitives

Testing `h5` rendering and indent indentation bounds.

###### 1.1.1.1.1 Fifth Tier: Atomic Register Bitfield Allocations

Deepest markdown heading tier (`h6`). Verify margin-left / indentation clamping, font scaling, and line truncation.

### 1.2 Second Tier: Return to Parent

Confirming that stepping back out from `h6` directly up to `h3` correctly restores the indentation level and structure tree.

#### 1.2.1 Third Tier Branch B

A parallel branch at depth 3 to ensure sibling nodes render cleanly.

## 2. Character Sets, Code Tokens & Formatting in Headings

### 2.1 Headings with `inline code` tokens like `document.querySelector('#toc')`

Does the TOC strip markdown or render formatted code tags appropriately?

### 2.2 Mathematical Equations: $\mathcal{O}(N \log N)$ and $\sum_{i=1}^n x_i^2$

Checking handling of inline LaTeX/MathJax or raw math symbols inside heading titles.

### 2.3 Special Symbols: & < > " ' / \ | ~ ^ * # % @

Testing HTML escaping and slug anchor generation (`id` attributes) when special characters are used.

### 2.4 Multilingual UTF-8 Characters: 日本語タイトル / 🚀 Эмодзи / Тестирование / 中文目录

Validating unicode slugification, anchor linking, font fallback, and bi-directional safety.

## 3. Extremely Long Heading Label Designed Specifically to Test Horizontal Wrapping, Text Ellipsis, Multi-Line Indentation and Responsive Viewport Clamping

A lengthy paragraph here to ensure the viewport has enough vertical scroll height for the intersection observer to register each section smoothly.

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.

### 3.1 SupercalifragilisticexpialidociousUnbrokenLongWordWithoutSpacesTestingWordBreakAndOverflowWrapBehaviorInNarrowSidebars

Notice how this heading contains a continuous uninterrupted token without whitespace. The sidebar container should not expand beyond its layout boundary or trigger unwanted horizontal document scroll.

## 4. Rapid Sequential Headings (Minimal Content Scrollspy Stress)

### 4.1 Rapid Section Alpha
Quick sentence.

### 4.2 Rapid Section Beta
Quick sentence.

### 4.3 Rapid Section Gamma
Quick sentence.

### 4.4 Rapid Section Delta
Quick sentence.

### 4.5 Rapid Section Epsilon
Quick sentence.

### 4.6 Rapid Section Zeta
Quick sentence.

### 4.7 Rapid Section Eta
Quick sentence.

### 4.8 Rapid Section Theta
Quick sentence.

## 5. Tall Sections with Abundant Vertical Body Content

### 5.1 Long Body Content Block A

Section with extended reading content to test scroll distance before the next TOC highlight activates.

```typescript
interface TocItem {
  id: string;
  depth: number;
  text: string;
  children?: TocItem[];
}

export function buildTocTree(headings: TocItem[]): TocItem[] {
  const root: TocItem[] = [];
  const stack: TocItem[] = [];

  for (const heading of headings) {
    while (stack.length > 0 && stack[stack.length - 1].depth >= heading.depth) {
      stack.pop();
    }
    if (stack.length === 0) {
      root.push(heading);
    } else {
      const parent = stack[stack.length - 1];
      parent.children = parent.children || [];
      parent.children.push(heading);
    }
    stack.push(heading);
  }

  return root;
}
```

Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.

### 5.2 Long Body Content Block B

Praesent sapien massa, convallis a pellentesque nec, egestas non nisi. Mauris blandit aliquet elit, eget tincidunt nibh pulvinar a. Curabitur aliquet quam id dui posuere blandit.

> Curabitur non nulla sit amet nisl tempus convallis quis ac lectus. Donec sollicitudin molestie malesuada. Vivamus suscipit tortor eget felis porttitor volutpat.

## 6. Duplicate Heading Title

### 6.1 Overview

First instance of the "Overview" section.

## 7. Duplicate Heading Title

### 7.1 Overview

Second instance of the "Overview" section to test automated slug de-duplication (e.g. `overview-1`).

## 8. Final Boundary and Footer Proximity

A concluding section positioned near the bottom of the article to test intersection observer behavior near page boundaries.
