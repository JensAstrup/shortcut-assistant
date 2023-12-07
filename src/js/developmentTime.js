function findFirstMatchingElement() {
    // Get all elements with the class 'value'
    const elementsWithValueClass = document.querySelectorAll('.value');

    for (const element of elementsWithValueClass) {
        // Check if any child element contains the text 'In Development'
        const child = Array.from(element.children).find(child => child.innerHTML === 'In Development');

        // If such a child is found, return the element and the child
        if (child) {
            return {element, child};
        }
    }

    // Return null if no matching element is found
    return null;
}

function parseDate(dateStr) {
    // Extract the time part from the date string
    const timePart = dateStr.match(/(\d+):(\d+) (am|pm)/i);
    if (!timePart) return new Date(dateStr); // Fallback if the regex doesn't match

    let [, hours, minutes, ampm] = timePart;
    hours = parseInt(hours, 10);
    minutes = parseInt(minutes, 10);

    // Convert hours to 24-hour format if needed
    if (ampm.toLowerCase() === 'pm' && hours < 12) {
        hours += 12;
    } else if (ampm.toLowerCase() === 'am' && hours === 12) {
        hours = 0;
    }

    // Replace the time part in the original date string with the 24-hour format time
    const adjustedDateStr = dateStr.replace(/(\d+):(\d+) (am|pm)/i, `${hours}:${minutes}`);

    return new Date(adjustedDateStr);
}


function hoursBetweenExcludingWeekends(startDateStr) {
    const startDate = parseDate(startDateStr);
    const now = new Date();

    let hours = 0;
    let currentDate = new Date(startDate);
    while (currentDate < now) {
        // If the day is not Saturday (6) or Sunday (0), add hours
        if (currentDate.getDay() !== 0 && currentDate.getDay() !== 6) {
            hours += 24; // Add 24 hours for each weekday
        }
        // Move to the next day
        currentDate.setDate(currentDate.getDate() + 1);
    }

    // Subtract the fractional day hours for the start and end days
    hours -= startDate.getHours() + startDate.getMinutes() / 60;
    hours -= 24 - (now.getHours() + now.getMinutes() / 60);

    return hours;
}

function isInDevelopment() {
    let storyState = ''
    try {
        const storyStateDiv = document.querySelector('.story-state')
        storyState = storyStateDiv.querySelector('.value').textContent
    } catch (e) {

    }
    return storyState === 'In Development';
}

async function checkDevelopmentTime() {
    await sleep(3000)
    const inDevelopment = isInDevelopment()
    if (!inDevelopment) {
        return
    }
    const latestUpdateElements = findFirstMatchingElement()
    const parentDiv = latestUpdateElements.element.parentElement
    const dateElement = parentDiv.querySelector('.date')
    const hoursElapsed = hoursBetweenExcludingWeekends(dateElement.innerHTML)

    if (hoursElapsed >= 36) {
        let emoji = '⚠️'
        if (hoursElapsed > 48) {
            emoji = '🚨'
        }
        const storyTitle = document.querySelector('.story-name')
        if (storyTitle.textContent.includes(emoji)) {
            return
        }
        storyTitle.innerHTML = `${emoji} ${storyTitle.innerHTML}`
    }
}


document.addEventListener('DOMContentLoaded', function() {
    checkDevelopmentTime()
}, false);

chrome.runtime.onMessage.addListener(
    async function (request, sender, sendResponse) {
        // listen for messages sent from background.js
        if (request.message === 'checkDevelopmentTime') {
            if (request.url.includes('story')) {
                await checkDevelopmentTime();
            }
        }
    });