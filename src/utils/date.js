export function formatDateTime(inputDate) {
    const date = new Date(inputDate);

    if (isNaN(date)) return ""; // Invalid date

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0"); // months are 0-indexed
    const day = String(date.getDate()).padStart(2, "0");

    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";

    hours = hours % 12;
    hours = hours === 0 ? 12 : hours; // 0 hour should be 12
    const formattedHours = String(hours).padStart(2, "0");

    return `${year}-${month}-${day} ${formattedHours}:${minutes} ${ampm}`;
}


export function formatTime(inputDate) {
    const date = new Date(inputDate);
    if (isNaN(date)) return ""; // Invalid date

    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";

    hours = hours % 12;
    hours = hours === 0 ? 12 : hours; // convert 0 hour to 12
    return `${hours}:${minutes} ${ampm}`;
}