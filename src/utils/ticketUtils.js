/**
 * Formats ticket data before submission to backend to match mobile app logic.
 * @param {Object} data - Form data with title, description, location, issue_type
 * @returns {Object} - Formatted data for API
 */
export const formatTicketSubmit = (data) => {
    const { description, location, issue_type, expected_resolution_time } = data;

    // Mobile App Logic: [$issueType] at $location
    const formattedTitle = `[${issue_type}] at ${location || 'N/A'}`;

    // Mobile App Logic: Location: $location\n\n$description
    const formattedDescription = `Location: ${location || 'N/A'}\n\n${description}`;

    return {
        title: formattedTitle,
        description: formattedDescription,
        issue_type,
        location,
        expected_resolution_time
    };
};

/**
 * Parses ticket data from backend strings back into components for UI display.
 * @param {Object} ticket - Raw ticket object from backend
 * @returns {Object} - Parsed data with location and clean description
 */
export const parseTicketData = (ticket) => {
    if (!ticket || !ticket.description) return ticket;

    const locationRegex = /Location: (.*?)\n/;
    const match = ticket.description.match(locationRegex);

    const extractedLocation = match ? match[1] : 'N/A';

    // Remove the location prefix from description for clean display
    let cleanDescription = ticket.description;
    if (match) {
        cleanDescription = ticket.description.replace(/Location: .*?\n\n?/, '').trim();
    }

    return {
        ...ticket,
        location: extractedLocation,
        cleanDescription: cleanDescription
    };
};
