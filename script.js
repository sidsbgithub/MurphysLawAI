// script.js
document.addEventListener('DOMContentLoaded', () => {

    // --- Element Selectors ---
    // Cache frequently accessed DOM elements for performance and easier access
    const tabButtons = document.querySelectorAll('.tab-button');
    const analyzerModes = document.querySelectorAll('.analyzer-mode');
    const mainContent = document.querySelector('main'); // Used for event delegation

    // Single Idea Analyzer Elements
    const ideaTextarea = document.getElementById('idea-textarea');
    const funMeter = document.getElementById('fun-meter');
    const funMeterValueDisplay = document.getElementById('fun-meter-value');
    const submitButton = document.getElementById('submit-button');
    const singleAnalysisResultsContainer = document.getElementById('single-analysis-results');
    
    // History Viewer Elements
    const historyListContainer = document.getElementById('history-list-container');
    const clearHistoryButton = document.getElementById('clear-history-button');
    
    // Comparative Analyzer Elements
    const idea1Textarea = document.getElementById('idea1-textarea');
    const idea2Textarea = document.getElementById('idea2-textarea');
    const compareFunMeterInput = document.getElementById('compare-fun-meter');
    const compareFunMeterValueDisplay = document.getElementById('compare-fun-meter-value');
    const compareSubmitButton = document.getElementById('compare-submit-button');
    const comparativeAnalysisResultsContainer = document.getElementById('comparative-analysis-results');

    // Results Template (cloned to display analysis)
    const resultsTemplate = document.getElementById('results-template');

    // Global variable to store the data of the most recent single idea analysis
    let currentAnalysisData = null; 
    // Key for storing analysis history in Local Storage
    const HISTORY_KEY = 'murphysLawAIHistory';

    // --- Tab Functionality ---
    // Handles switching between different sections of the application (Single Analysis, Compare, History)
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Deactivate all tabs and hide all content sections first
            tabButtons.forEach(btn => btn.classList.remove('active'));
            analyzerModes.forEach(mode => {
                mode.classList.remove('active'); // For CSS transition
                mode.style.display = 'none';    // Explicitly hide
            });

            // Activate the clicked tab button
            button.classList.add('active');

            // Determine and activate the corresponding content section
            let targetModeId = null;
            switch (button.id) {
                case 'single-idea-tab':
                    targetModeId = 'single-idea-analyzer';
                    break;
                case 'compare-ideas-tab':
                    targetModeId = 'comparative-analyzer';
                    break;
                case 'history-tab':
                    targetModeId = 'history-viewer';
                    loadHistory(); // Load history items when this tab is activated
                    break;
                default:
                    console.error("Unknown tab button ID:", button.id);
                    return; // Exit if tab ID is not recognized
            }
            
            if (targetModeId) {
                const targetMode = document.getElementById(targetModeId);
                if (targetMode) {
                    targetMode.style.display = 'block'; // Make section visible
                    // Short delay to ensure display:block is rendered before CSS transition class is added
                    setTimeout(() => targetMode.classList.add('active'), 10); 
                } else {
                    console.error(`Target mode section with ID '${targetModeId}' not found in HTML.`);
                }
            }
        });
    });
    
    // --- Fun Meter Slider ---
    // Updates the displayed numerical value next to a range slider
    function updateFunMeterDisplay(slider, display) {
        if (slider && display) {
            display.textContent = slider.value; // Set initial value
            slider.addEventListener('input', () => { // Update on slider interaction
                display.textContent = slider.value;
            });
        }
    }
    updateFunMeterDisplay(funMeter, funMeterValueDisplay); // For single idea fun meter
    updateFunMeterDisplay(compareFunMeterInput, compareFunMeterValueDisplay); // For compare ideas fun meter
    
    // --- Analyze Idea (Single Idea Submission) ---
    if (submitButton) {
        submitButton.addEventListener('click', async () => {
            const idea = ideaTextarea.value.trim();
            const funLevel = funMeter.value;

            if (!idea) {
                alert("Please enter an AI idea to analyze.");
                ideaTextarea.focus();
                return;
            }

            // Show loading indicator and clear previous results
            singleAnalysisResultsContainer.innerHTML = ''; 
            const loadingIndicatorHTML = `
                <div class="loading" id="dynamic-loading-indicator">
                    Analyzing your brilliant (or flawed) idea... Please hold on!
                </div>`;            singleAnalysisResultsContainer.insertAdjacentHTML('beforeend', loadingIndicatorHTML);
            currentAnalysisData = null; // Reset data for current analysis

            try {
                // Fetch analysis from backend
                const response = await fetch('https://murphyslawai-backend.onrender.com/api/analyze', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', },
                    body: JSON.stringify({ idea: idea, funMeter: funLevel }),
                });

                const dynamicLoadingIndicator = document.getElementById('dynamic-loading-indicator');
                if (dynamicLoadingIndicator) dynamicLoadingIndicator.remove();

                if (!response.ok) { // Check for HTTP errors
                    const errorData = await response.json();
                    throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                // Store data for potential saving to history or sharing
                currentAnalysisData = { ideaSummary: idea, analysisText: data.analysis, timestamp: new Date().toISOString() };
                displayAnalysisResults(data.analysis, idea, singleAnalysisResultsContainer);

            } catch (error) {
                console.error("Error fetching analysis:", error);
                const errorBoxHTML = `<div class="error-box">Error: ${error.message}</div>`;
                singleAnalysisResultsContainer.innerHTML = errorBoxHTML; 
            }
        });
    }

    // --- Compare Ideas Functionality ---
    if (compareSubmitButton) {
        compareSubmitButton.addEventListener('click', async () => {
            const idea1 = idea1Textarea.value.trim();
            const idea2 = idea2Textarea.value.trim();
            const funLevel = compareFunMeterInput.value;

            if (!idea1 || !idea2) {
                alert("Please enter two AI ideas to compare.");
                if (!idea1) idea1Textarea.focus();
                else idea2Textarea.focus();
                return;
            }

            // Show loading indicator and clear previous results
            comparativeAnalysisResultsContainer.innerHTML = ''; 
            const loadingIndicatorHTML = `
                <div class="loading" id="dynamic-compare-loading-indicator">
                    Comparing ideas... This might take a moment!
                </div>`;
            comparativeAnalysisResultsContainer.insertAdjacentHTML('beforeend', loadingIndicatorHTML);

            try {
                // Fetch comparison from backend
                const response = await fetch('https://murphyslawai-backend.onrender.com/api/compare', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', },
                    body: JSON.stringify({ idea1: idea1, idea2: idea2, funMeter: funLevel }),
                });

                const dynamicLoadingIndicator = document.getElementById('dynamic-compare-loading-indicator');
                if (dynamicLoadingIndicator) dynamicLoadingIndicator.remove();

                if (!response.ok) { // Check for HTTP errors
                    const errorData = await response.json();
                    throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                displayComparisonResults(data.comparison, comparativeAnalysisResultsContainer);

            } catch (error) {
                console.error("Error fetching comparison:", error);
                const errorBoxHTML = `<div class="error-box">Error: ${error.message}</div>`;
                comparativeAnalysisResultsContainer.innerHTML = errorBoxHTML;
            }
        });
    }

    // --- Display Comparison Results (Parses basic Markdown from Gemini) ---
    function displayComparisonResults(comparisonText, targetContainer) {
        targetContainer.innerHTML = ''; 
        const resultsDiv = document.createElement('div');
        resultsDiv.classList.add('comparison-output-content'); 
        
        if (!comparisonText || comparisonText.trim() === "") {
            resultsDiv.innerHTML = "<p>No comparison data was returned.</p>";
            targetContainer.appendChild(resultsDiv);
            return;
        }
        
        // Basic Markdown to HTML conversion
        const lines = comparisonText.split('\n');
        let currentHtml = "";
        let inList = false;

        lines.forEach(line => {
            line = line.trim(); 
            if (line.startsWith('## ')) { // H2
                if (inList) { currentHtml += '</ul>\n'; inList = false; }
                currentHtml += `<h2>${line.substring(3).trim().replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}</h2>\n`;
            } else if (line.startsWith('### ')) { // H3
                if (inList) { currentHtml += '</ul>\n'; inList = false; }
                currentHtml += `<h3>${line.substring(4).trim().replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}</h3>\n`;
            } else if (line.startsWith('* ') || line.startsWith('- ')) { // List items
                if (!inList) { currentHtml += '<ul>\n'; inList = true; }
                const listItemContent = line.substring(2).trim().replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                currentHtml += `  <li>${listItemContent}</li>\n`;
            } else if (line) { // Paragraphs
                if (inList) { currentHtml += '</ul>\n'; inList = false; }
                currentHtml += `<p>${line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}</p>\n`;
            } else { // Empty line (potential list terminator)
                if (inList) { currentHtml += '</ul>\n'; inList = false; }
            }
        });
        if (inList) { currentHtml += '</ul>\n'; } // Close any trailing list
        
        resultsDiv.innerHTML = currentHtml;
        targetContainer.appendChild(resultsDiv);
    }

    // --- Generate Shareable Text (also used for Export) ---
    // Creates a plain text summary of the analysis for clipboard or file.
    function generateShareableText(analysisData) {
        if (!analysisData || !analysisData.ideaSummary || !analysisData.analysisText) { return "No analysis data available."; }
        let shareText = `Murphy's Law AI Analysis for: ${analysisData.ideaSummary}\n========================================\n\n`;
        const lines = analysisData.analysisText.split('\n');
        let currentSectionTitleForShare = ""; let inFlawsSectionForShare = false;  
        lines.forEach(line => {
            line = line.trim();
            if (line.startsWith('## ')) { 
                currentSectionTitleForShare = line.substring(3).trim();
                shareText += `\n--- ${currentSectionTitleForShare.toUpperCase()} ---\n`;
                inFlawsSectionForShare = currentSectionTitleForShare.toLowerCase().includes('objective flaws');
            } else if (line.startsWith('### Category:')) { 
                shareText += `\nCATEGORY: ${line.substring(4).trim().toUpperCase()}\n`;
            } else if (line.startsWith('- ')) { 
                let item = line.substring(2).trim();
                if (inFlawsSectionForShare) { 
                    const severityMatch = item.match(/(.+)\(Severity:\s*(Low|Medium|High)\s*\)/i);
                    const textBeforeSeverity = severityMatch ? severityMatch[1].trim() : item;
                    const severity = severityMatch ? `(Severity: ${severityMatch[2]})` : '';
                    const delimiter = " - ";
                    const delimiterIndex = textBeforeSeverity.indexOf(delimiter);
                    let itemTitle = textBeforeSeverity;
                    let itemDescription = "";
                    if (delimiterIndex !== -1) {
                        itemTitle = textBeforeSeverity.substring(0, delimiterIndex).trim().replace(/^\*\*(.*?)\*\*$/, '$1');
                        itemDescription = textBeforeSeverity.substring(delimiterIndex + delimiter.length).trim();
                        shareText += `  • ${itemTitle}: ${itemDescription} ${severity.trim()}\n`;
                    } else { 
                        shareText += `  • ${textBeforeSeverity} ${severity.trim()}\n`;
                    }
                } else { 
                    const delimiter = " - ";
                    const delimiterIndex = item.indexOf(delimiter);
                    let itemTitle = item;
                    let itemDescription = "";
                    if (delimiterIndex !== -1) {
                        itemTitle = item.substring(0, delimiterIndex).trim().replace(/^\*\*(.*?)\*\*$/, '$1');
                        itemDescription = item.substring(delimiterIndex + delimiter.length).trim();
                        shareText += `  • ${itemTitle}: ${itemDescription}\n`;
                    } else {
                        shareText += `  • ${itemTitle.replace(/^\*\*(.*?)\*\*$/, '$1')}\n`;
                    }
                }
            } else if (line) { // Non-bullet, non-header lines
                if (currentSectionTitleForShare.toLowerCase().includes('exploration') || currentSectionTitleForShare.toLowerCase().includes('rating')) {
                    if (currentSectionTitleForShare.toLowerCase().includes('exploration') && shareText.endsWith('---\n')) { // First line of exploration
                        const delimiter = " - ";
                        const delimiterIndex = line.indexOf(delimiter);
                        if (delimiterIndex !== -1) { // Try to parse Title - Description
                            let explorationTitle = line.substring(0, delimiterIndex).trim().replace(/^\*\*(.*?)\*\*$/, '$1');
                            let explorationDescription = line.substring(delimiterIndex + delimiter.length).trim();
                            shareText += `${explorationTitle.toUpperCase()}: ${explorationDescription}\n`;
                        } else { shareText += `${line}\n`; } // Fallback if no delimiter
                    } else { shareText += `${line}\n`; } // Subsequent lines
                }
                // Avoid adding general lines from within flaws if they weren't bullet points
            }
        });
        shareText += "\n========================================\nAnalyzed with Murphy's Law of AI";
        return shareText;
    }

    // --- Download Text File ---
    // Triggers a browser download for the given text content and filename.
    function downloadTextFile(filename, text) {
        const element = document.createElement('a');
        element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
        element.setAttribute('download', filename);
        element.style.display = 'none'; // Link doesn't need to be visible
        document.body.appendChild(element);
        element.click(); // Programmatically click the link to trigger download
        document.body.removeChild(element); // Clean up the temporary link
    }

    // --- Helper function to update a specific accordion content's height ("Soft Refresh") ---
    // This is called when a child element's height changes to ensure the parent accordion adjusts.
    function triggerParentAccordionRecalculate(childElement) {
        const accordionContent = childElement.closest('.accordion-content');
        if (accordionContent && accordionContent.style.display === 'block') {
            const header = accordionContent.previousElementSibling;
            // Only update if the parent accordion is actually open (its header is active)
            if (header && header.classList.contains('accordion-header') && header.classList.contains('active')) {
                // Force browser to recalculate layout by reading a layout property
                void accordionContent.offsetWidth; 
                // Then, in the next animation frame, set the maxHeight
                requestAnimationFrame(() => {
                    accordionContent.style.maxHeight = accordionContent.scrollHeight + "px";
                });
            }
        }
    }

    // --- Display Analysis Results (Single Idea) ---
    // Parses Gemini's Markdown response and populates the accordion structure.
    function displayAnalysisResults(analysisText, ideaSummary, targetContainer) {
        targetContainer.innerHTML = ''; 
        if (!resultsTemplate) { console.error("Results template not found!"); targetContainer.innerHTML = '<div class="error-box">Error: UI template missing.</div>'; return; }
        
        const newResultsDiv = resultsTemplate.cloneNode(true); // Clone the hidden template
        newResultsDiv.id = `results-${Date.now()}`; // Give it a unique ID
        newResultsDiv.style.display = 'block'; // Make the cloned structure visible
        
        const ideaTitleEl = newResultsDiv.querySelector('.idea-title-placeholder');
        if (ideaTitleEl) { ideaTitleEl.textContent = `Analysis for: "${ideaSummary.substring(0, 50)}${ideaSummary.length > 50 ? '...' : ''}"`; }
        
        // Get references to the placeholder elements within the cloned template
        const sections = {
            exploration: newResultsDiv.querySelector('.exploration-output'), 
            pros: newResultsDiv.querySelector('.pros-output'), 
            flaws: newResultsDiv.querySelector('.flaws-container'), 
            mitigation: newResultsDiv.querySelector('.mitigation-output'), 
            rating: newResultsDiv.querySelector('.rating-output') 
        };

        // Clear any default placeholder content (like '-') from the template
        Object.values(sections).forEach(sectionEl => {
            if (sectionEl) {
                if (sectionEl.tagName === 'UL') sectionEl.innerHTML = ''; // Clear LIs
                else if (sectionEl.tagName === 'P' && (sectionEl.textContent === '-' || sectionEl.textContent.trim() === '')) sectionEl.textContent = ''; // Clear P
                else if (sectionEl.classList.contains('flaws-container')) sectionEl.innerHTML = ''; // Clear flaws container
                else if (sectionEl.classList.contains('exploration-output')) sectionEl.innerHTML = ''; 
            }
        });

        const lines = analysisText.split('\n');
        let currentSectionKey = null; 
        let currentFlawCategoryUl = null; 
        const delimiter = " - "; // Used to split "Title - Description"

        lines.forEach(line => {
            line = line.trim();

            // Determine current section based on Markdown headers
            if (line.startsWith('## Idea Exploration:')) { currentSectionKey = 'exploration'; }
            else if (line.startsWith('## Pros:')) { currentSectionKey = 'pros'; }
            else if (line.startsWith('## Objective Flaws')) { currentSectionKey = 'flaws'; currentFlawCategoryUl = null; }
            else if (line.startsWith('## Mitigation Strategies:')) { currentSectionKey = 'mitigation'; }
            else if (line.startsWith('## Overall Rating')) { currentSectionKey = 'rating'; }
            // Handle flaw categories (H3 within Flaws section)
            else if (currentSectionKey === 'flaws' && line.startsWith('### Category:')) {
                const categoryName = line.replace('### Category:', '').trim();
                if(sections.flaws && categoryName){
                    const categoryTitle = document.createElement('h4'); categoryTitle.textContent = categoryName; sections.flaws.appendChild(categoryTitle);
                    currentFlawCategoryUl = document.createElement('ul'); sections.flaws.appendChild(currentFlawCategoryUl);
                } else { currentFlawCategoryUl = null; }
            }
            // Handle bullet list items for Pros, Mitigations, and Flaws
            else if (line.startsWith('- ') && (currentSectionKey === 'pros' || currentSectionKey === 'mitigation' || currentSectionKey === 'flaws')) {
                let itemContent = line.substring(2).trim(); if (!itemContent) return; // Skip empty bullets
                let itemTitle = itemContent; let itemDescription = "";

                if (currentSectionKey === 'flaws') {
                    // Parse flaw: Title - Description (Severity: Level)
                    const severityMatch = itemContent.match(/(.+)\(Severity:\s*(Low|Medium|High)\s*\)/i);
                    const textBeforeSeverity = severityMatch ? severityMatch[1].trim() : itemContent;
                    const severity = severityMatch ? severityMatch[2].toLowerCase() : 'medium'; // Default severity
                    const delimiterIndex = textBeforeSeverity.indexOf(delimiter);
                    if (delimiterIndex !== -1) { itemTitle = textBeforeSeverity.substring(0, delimiterIndex).trim(); itemDescription = textBeforeSeverity.substring(delimiterIndex + delimiter.length).trim(); } 
                    else { itemTitle = textBeforeSeverity; } // If no " - ", title is everything before severity
                    itemTitle = itemTitle.replace(/^\*\*(.*?)\*\*$/, '$1').replace(/^-(.*)-$/, '$1').trim(); // Clean ** or - from title

                    // Create DOM elements for the flaw item
                    const flawItemDiv = document.createElement('div'); flawItemDiv.classList.add('flaw-item');
                    const titleSpan = document.createElement('span'); titleSpan.classList.add('flaw-title'); titleSpan.textContent = itemTitle; flawItemDiv.appendChild(titleSpan);
                    if (itemDescription) { const descriptionP = document.createElement('p'); descriptionP.classList.add('flaw-description'); descriptionP.textContent = itemDescription; flawItemDiv.appendChild(descriptionP); }
                    const severitySpan = document.createElement('span'); severitySpan.classList.add('flaw-severity', `severity-${severity}`); severitySpan.textContent = `Severity: ${severity.charAt(0).toUpperCase() + severity.slice(1)}`; flawItemDiv.appendChild(severitySpan);
                    
                    // Add button and placeholder for interactive flaw details
                    const detailsButton = document.createElement('button'); detailsButton.classList.add('flaw-details-button'); detailsButton.textContent = 'Details & Mitigations';
                    detailsButton.dataset.flawTitle = itemTitle; // Store data on button for later retrieval
                    detailsButton.dataset.flawDescription = itemDescription || '';
                    const mitigationDetailsDiv = document.createElement('div'); mitigationDetailsDiv.classList.add('flaw-mitigation-details'); // Initially hidden by CSS
                    flawItemDiv.appendChild(detailsButton); flawItemDiv.appendChild(mitigationDetailsDiv);
                    
                    const flawLi = document.createElement('li'); flawLi.appendChild(flawItemDiv);
                    // Append to specific category UL or a default UL for uncategorized flaws
                    if (currentFlawCategoryUl) { currentFlawCategoryUl.appendChild(flawLi); } 
                    else { 
                        let defaultFlawUl = sections.flaws.querySelector('ul.uncategorized-flaws'); 
                        if (!defaultFlawUl) { defaultFlawUl = document.createElement('ul'); defaultFlawUl.classList.add('uncategorized-flaws'); 
                            if (!sections.flaws.querySelector('h4')) sections.flaws.prepend(defaultFlawUl); // Prepend if no categories yet
                            else sections.flaws.appendChild(defaultFlawUl); // Append after categories
                        } 
                        defaultFlawUl.appendChild(flawLi); 
                    }
                } else { // For Pros and Mitigations (Title - Description format)
                    const delimiterIndex = itemContent.indexOf(delimiter);
                    if (delimiterIndex !== -1) { itemTitle = itemContent.substring(0, delimiterIndex).trim(); itemDescription = itemContent.substring(delimiterIndex + delimiter.length).trim(); } 
                    else { itemTitle = itemContent; } // If no " - ", entire line is title
                    itemTitle = itemTitle.replace(/^\*\*(.*?)\*\*$/, '$1').trim(); // Clean ** from title
                    
                    const li = document.createElement('li');
                    const titleSpan = document.createElement('span'); titleSpan.classList.add('item-title'); titleSpan.textContent = itemTitle; li.appendChild(titleSpan);
                    if (itemDescription) { const descriptionP = document.createElement('p'); descriptionP.classList.add('item-description'); descriptionP.textContent = itemDescription; li.appendChild(descriptionP); }
                    sections[currentSectionKey].appendChild(li);
                }
            } 
            // Handle paragraph content for Exploration
            else if (currentSectionKey === 'exploration' && sections.exploration && line) {
                const delimiterIndexExploration = line.indexOf(delimiter); 
                const explorationIsEmpty = sections.exploration.innerHTML.trim() === '';
                if (delimiterIndexExploration !== -1 && explorationIsEmpty) { // Try to parse Title - Description for first line
                    let explorationTitle = line.substring(0, delimiterIndexExploration).trim().replace(/^\*\*(.*?)\*\*$/, '$1');
                    let explorationDescription = line.substring(delimiterIndexExploration + delimiter.length).trim();
                    const titleEl = document.createElement('strong'); titleEl.classList.add('item-title'); titleEl.textContent = explorationTitle; sections.exploration.appendChild(titleEl);
                    const descTextNode = document.createTextNode(" " + delimiter + " " + explorationDescription); sections.exploration.appendChild(descTextNode);
                } else { // Append as plain text, adding <br> for newlines within the section
                    if (!explorationIsEmpty) { sections.exploration.appendChild(document.createElement('br')); } 
                    sections.exploration.appendChild(document.createTextNode(line)); 
                }
            } 
            // Handle Rating text
            else if (currentSectionKey === 'rating' && sections.rating && (line.toLowerCase().includes('rating:') || line.match(/^\d+\/10/))) {
                 if (sections.rating.textContent.startsWith('No rating')) sections.rating.textContent = ''; // Clear placeholder
                sections.rating.textContent += (sections.rating.textContent.trim() ? ' ' : '') + line; // Append rating line
            }
        });

        // Add default messages if sections are still empty after parsing
        if(sections.exploration && !sections.exploration.textContent.trim()) sections.exploration.innerHTML = '<strong class="item-title">Exploration</strong><span class="item-description"> - No exploration data provided.</span>';
        if(sections.pros && !sections.pros.hasChildNodes()) sections.pros.innerHTML = '<li><strong class="item-title">Pros</strong><p class="item-description">No pros identified.</p></li>';
        if(sections.flaws && !sections.flaws.hasChildNodes()) sections.flaws.innerHTML = '<p>No flaws identified.</p>';
        if(sections.mitigation && !sections.mitigation.hasChildNodes()) sections.mitigation.innerHTML = '<li><strong class="item-title">Mitigations</strong><p class="item-description">No specific mitigation strategies provided.</p></li>';
        if(sections.rating && !sections.rating.textContent.trim()) sections.rating.textContent = 'No rating provided.';

        targetContainer.appendChild(newResultsDiv); // Add the populated results to the page

        // Trigger staggered animation for the new accordion items
        const newAccordionItems = newResultsDiv.querySelectorAll('.accordion-item');
        newAccordionItems.forEach((item, index) => { setTimeout(() => item.classList.add('revealed'), index * 100); });
    }

    // --- Display Flaw Details and Mitigations ---
    // Populates the dedicated div within a flaw item with detailed explanation and mitigations.
    function displayFlawDetails(detailsText, detailsContainer) {
        detailsContainer.innerHTML = ''; // Clear previous content (e.g., loading spinner)
        if (!detailsText || detailsText.trim() === "") {
            detailsContainer.innerHTML = "<p>No further details available for this flaw.</p>";
        } else {
            // Parse the Markdown-like response for flaw details
            const lines = detailsText.split('\n');
            let currentDetailSection = null; 
            let listElement = null; // To hold current <ul> for mitigations

            lines.forEach(line => {
                line = line.trim();
                if (line.startsWith('### In-Depth Flaw Explanation:')) {
                    currentDetailSection = 'explanation'; 
                    if (listElement) listElement = null; // Reset list if switching section
                    const title = document.createElement('h5'); 
                    title.textContent = "In-Depth Explanation:"; 
                    detailsContainer.appendChild(title);
                } else if (line.startsWith('### Targeted Mitigation Strategies:')) {
                    currentDetailSection = 'mitigations';
                    const title = document.createElement('h5'); 
                    title.textContent = "Targeted Mitigations:"; 
                    detailsContainer.appendChild(title);
                    listElement = document.createElement('ul'); // Create UL for mitigation list
                    detailsContainer.appendChild(listElement);
                } else if (line.startsWith('- ') && currentDetailSection === 'mitigations' && listElement) {
                    // Mitigation strategy list item
                    const itemText = line.substring(2).trim(); 
                    const li = document.createElement('li');
                    const delimiterDetail = ":"; // Simple delimiter for "Strategy Title: Description"
                    const delimiterIndexDetail = itemText.indexOf(delimiterDetail);
                    // Try to parse "Strategy Title: Description"
                    if (itemText.startsWith('**') && delimiterIndexDetail > 0) {
                        const mitTitle = itemText.substring(0, delimiterIndexDetail).replace(/\*\*/g, '').trim();
                        const mitDesc = itemText.substring(delimiterIndexDetail + 1).trim();
                        li.innerHTML = `<strong>${mitTitle}:</strong> ${mitDesc}`; // Format with bold title
                    } else { 
                        li.textContent = itemText; // Fallback to plain text
                    }
                    listElement.appendChild(li);
                } else if (line && currentDetailSection === 'explanation') {
                    // Paragraph for flaw explanation
                    const p = document.createElement('p'); 
                    p.textContent = line; 
                    detailsContainer.appendChild(p);
                } else if (line && currentDetailSection === 'mitigations' && !line.startsWith('- ') && listElement) {
                    // Handle multi-line text for a mitigation strategy (append to last list item)
                    const lastLi = listElement.lastElementChild;
                    if(lastLi) { 
                        lastLi.innerHTML += `<br>${line}`; 
                    } else { // Fallback if no list item yet (shouldn't happen if format is correct)
                        const p = document.createElement('p'); 
                        p.textContent = line; 
                        detailsContainer.appendChild(p); 
                    }
                }
            });
        }
        
        // Make the details container visible and animate its height
        detailsContainer.classList.add('visible'); 
        detailsContainer.style.display = 'block'; // Must be block for scrollHeight calculation
        requestAnimationFrame(() => { // Ensure DOM updates are processed before reading scrollHeight
            detailsContainer.style.maxHeight = detailsContainer.scrollHeight + "px";
            detailsContainer.style.padding = "15px"; 
            detailsContainer.style.marginTop = "12px";
            // Trigger parent accordion ("Objective Flaws") to recalculate its height
            triggerParentAccordionRecalculate(detailsContainer); 
        });
    }

    // --- History Functionality ---
    function getHistory() { return JSON.parse(localStorage.getItem(HISTORY_KEY)) || []; }
    function saveToHistory(analysisData) {
        if (!analysisData || !analysisData.ideaSummary || !analysisData.analysisText) return;
        const history = getHistory();
        // Prevent duplicates based on summary and timestamp (simple check)
        if (!history.some(item => item.ideaSummary === analysisData.ideaSummary && item.timestamp === analysisData.timestamp)) {
            history.unshift(analysisData); // Add to beginning of array
            localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, 20))); // Limit history size
        }
    }
    function loadHistory() {
        if (!historyListContainer) return; 
        historyListContainer.innerHTML = ''; // Clear current list
        const history = getHistory();
        if (history.length === 0) { historyListContainer.innerHTML = '<p>No saved analyses yet.</p>'; return; }
        history.forEach((item, index) => {
            const historyItemDiv = document.createElement('div'); 
            historyItemDiv.classList.add('history-item'); 
            historyItemDiv.dataset.historyIndex = index; // Store index to retrieve full data on click
            const titleSpan = document.createElement('span'); 
            titleSpan.classList.add('history-item-title'); 
            titleSpan.textContent = item.ideaSummary.substring(0, 60) + (item.ideaSummary.length > 60 ? '...' : ''); 
            historyItemDiv.appendChild(titleSpan);
            const dateSpan = document.createElement('span'); 
            dateSpan.classList.add('history-item-date'); 
            dateSpan.textContent = `Analyzed: ${new Date(item.timestamp).toLocaleDateString()} ${new Date(item.timestamp).toLocaleTimeString()}`; 
            historyItemDiv.appendChild(dateSpan);
            historyListContainer.appendChild(historyItemDiv);
        });
    }
    if (clearHistoryButton) { 
        clearHistoryButton.addEventListener('click', () => { 
            if (confirm("Are you sure you want to clear all saved analysis history?")) { 
                localStorage.removeItem(HISTORY_KEY); 
                loadHistory(); 
            } 
        }); 
    }
    if (historyListContainer) { // Event listener for clicking on a history item
        historyListContainer.addEventListener('click', (event) => {
            const clickedItem = event.target.closest('.history-item');
            if (clickedItem && clickedItem.dataset.historyIndex !== undefined) {
                const history = getHistory(); 
                const itemData = history[parseInt(clickedItem.dataset.historyIndex)];
                if (itemData) {
                    const singleIdeaTab = document.getElementById('single-idea-tab'); 
                    if (singleIdeaTab) singleIdeaTab.click(); // Switch to single idea tab
                    ideaTextarea.value = itemData.ideaSummary; // Populate textarea
                    currentAnalysisData = itemData; // Set as current for potential re-save/share
                    displayAnalysisResults(itemData.analysisText, itemData.ideaSummary, singleAnalysisResultsContainer); // Display the saved analysis
                }
            }
        });
    }
    
    // Main event listener for accordion toggles and dynamically added buttons (Save, Share, Export, Flaw Details)
    mainContent.addEventListener('click', async function(event) {
        const target = event.target;

        // Accordion Functionality (Main Accordion Toggle for sections like Pros, Flaws, etc.)
        const mainAccordionHeader = target.closest('.accordion-header');
        // Ensure it's a main accordion header and NOT the flaw details button (which has its own specific handler)
        if (mainAccordionHeader && !target.classList.contains('flaw-details-button') && !target.closest('.flaw-details-button')) {
            const mainAccordionContent = mainAccordionHeader.nextElementSibling;
            if (mainAccordionContent && mainAccordionContent.classList.contains('accordion-content')) { 
                const isActive = mainAccordionHeader.classList.contains('active');
                mainAccordionHeader.classList.toggle('active');
                if (isActive) { // Collapsing
                    mainAccordionContent.style.maxHeight = null; // For CSS transition to 0
                    // Set display to none after transition completes
                    setTimeout(() => { 
                        if (!mainAccordionHeader.classList.contains('active')) { // Double check it's still collapsed
                            mainAccordionContent.style.display = "none"; 
                        }
                    }, 300); // Should match CSS transition duration
                } else { // Expanding
                    mainAccordionContent.style.display = "block"; // Make it visible
                    requestAnimationFrame(() => { // Wait for display:block to apply before reading scrollHeight
                        mainAccordionContent.style.maxHeight = mainAccordionContent.scrollHeight + "px";
                    });
                }
            }
        }

        // Action Button Functionality (Save, Share, Export)
        if (target.classList.contains('save-history-button')) {
            if (currentAnalysisData) { 
                saveToHistory(currentAnalysisData); 
                target.textContent = 'Saved!'; 
                target.disabled = true; 
                setTimeout(() => { target.textContent = 'Save to History'; target.disabled = false; }, 2000); 
            } else { alert("No current analysis to save."); }
            return; // Handled
        }
        if (target.classList.contains('share-button')) {
            if (currentAnalysisData) { 
                const textToShare = generateShareableText(currentAnalysisData); 
                try { await navigator.clipboard.writeText(textToShare); target.textContent = 'Copied!'; } 
                catch (err) { console.error('Failed to copy: ', err); target.textContent = 'Copy Failed'; alert("Failed to copy. You can manually copy from the console."); console.log("--- For Manual Copy --- \n", textToShare); } 
                setTimeout(() => { target.textContent = 'Share Analysis'; }, 2500); 
            } else { alert("No current analysis to share."); }
            return; // Handled
        }
        if (target.classList.contains('export-report-button')) {
            if (currentAnalysisData) { 
                const reportText = generateShareableText(currentAnalysisData); 
                const ideaTitleForFile = currentAnalysisData.ideaSummary.substring(0, 30).replace(/[^a-z0-9]/gi, '_').toLowerCase() || "ai_analysis"; 
                const filename = `murphys_law_ai_report_${ideaTitleForFile}.txt`; 
                downloadTextFile(filename, reportText); 
                target.textContent = 'Exported!'; 
                setTimeout(() => { target.textContent = 'Export Report'; }, 2500); 
            } else { alert("No current analysis to export."); }
            return; // Handled
        }
        
        // Flaw Details Button Click
        if (target.classList.contains('flaw-details-button')) {
            if (!currentAnalysisData || !currentAnalysisData.ideaSummary) { alert("Original idea context not found. Please re-analyze."); return; }
            const flawTitle = target.dataset.flawTitle; 
            const flawDescription = target.dataset.flawDescription;
            const detailsContainer = target.nextElementSibling; // The .flaw-mitigation-details div
            const parentAccordionContentForFlaw = detailsContainer.closest('.accordion-item > .accordion-content'); // The main accordion content (e.g., for "Objective Flaws")

            // Toggle visibility or fetch new details
            if (detailsContainer.classList.contains('visible') && detailsContainer.innerHTML.trim() !== "" && !target.classList.contains('loading-details')) {
                // Hiding details
                detailsContainer.classList.remove('visible'); 
                detailsContainer.style.maxHeight = null; 
                detailsContainer.style.padding = "0"; 
                detailsContainer.style.marginTop = "0";
                if (parentAccordionContentForFlaw) triggerParentAccordionRecalculate(detailsContainer); // Update parent on collapse
                setTimeout(() => { if(!detailsContainer.classList.contains('visible')) detailsContainer.style.display = 'none';}, 400); // Hide after animation
            } else {
                // Showing or fetching details
                detailsContainer.innerHTML = '<div class="mini-spinner"></div> Loading details...'; 
                detailsContainer.classList.add('visible'); 
                detailsContainer.style.display = 'block';
                requestAnimationFrame(() => { // Set initial height for loading text
                    detailsContainer.style.maxHeight = detailsContainer.scrollHeight + 'px'; 
                    detailsContainer.style.padding = "15px"; 
                    detailsContainer.style.marginTop = "12px";
                    if (parentAccordionContentForFlaw) triggerParentAccordionRecalculate(detailsContainer); // Update parent for loading text
                });

                target.classList.add('loading-details'); 
                target.disabled = true;
                try {
                    const response = await fetch('https://murphyslawai-backend.onrender.com/api/flaw-detail', {
                        method: 'POST', 
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ 
                            ideaSummary: currentAnalysisData.ideaSummary, 
                            flawTitle: flawTitle, 
                            flawDescription: flawDescription, 
                            funMeter: funMeter.value // Use fun meter from single idea tab
                        })
                    });
                    if (!response.ok) { 
                        const errorData = await response.json(); 
                        throw new Error(errorData.error || `HTTP error! Status: ${response.status}`); 
                    }
                    const data = await response.json(); 
                    // displayFlawDetails will populate, set its own height, and then call triggerParentAccordionRecalculate
                    displayFlawDetails(data.flawDetails, detailsContainer); 
                } catch (error) { 
                    console.error("Error fetching flaw details:", error); 
                    detailsContainer.innerHTML = `<p class="error-text">Error: ${error.message}</p>`; 
                    requestAnimationFrame(() => { // Set height for error message
                        detailsContainer.style.maxHeight = detailsContainer.scrollHeight + "px"; 
                        if (parentAccordionContentForFlaw) triggerParentAccordionRecalculate(detailsContainer); // Update parent for error
                    });
                } 
                finally { 
                    target.classList.remove('loading-details'); 
                    target.disabled = false; 
                }
            }
            return; // Handled flaw details button
        }
    });

    // --- Initial Setup ---
    // Ensures the correct tab is active and its content visible on page load.
    function initializeApp() {
        const initialActiveTab = document.querySelector('#mode-selector .tab-button.active');
        if (initialActiveTab) {
            let initialTargetModeId = initialActiveTab.id.replace('-tab', '-analyzer');
            if (initialActiveTab.id === 'history-tab') initialTargetModeId = 'history-viewer';
            
            const initialTargetMode = document.getElementById(initialTargetModeId);
            if (initialTargetMode) { 
                initialTargetMode.style.display = 'block'; 
                setTimeout(() => initialTargetMode.classList.add('active'), 10); 
                if (initialActiveTab.id === 'history-tab') loadHistory(); 
            }
        } else if (tabButtons.length > 0) { // Fallback to activate the first tab if none are marked active
            tabButtons[0].classList.add('active');
            let firstModeId = tabButtons[0].id.replace('-tab', '-analyzer');
            if (tabButtons[0].id === 'history-tab') firstModeId = 'history-viewer';

            const firstMode = document.getElementById(firstModeId);
            if (firstMode) { 
                firstMode.style.display = 'block'; 
                setTimeout(() => firstMode.classList.add('active'), 10); 
                if (tabButtons[0].id === 'history-tab') loadHistory(); 
            }
        }
    }
    initializeApp(); // Run initial setup on page load

    console.log("Murphy's Law AI Initialized - Full Script with Comments & Refined Soft Refresh!");
});