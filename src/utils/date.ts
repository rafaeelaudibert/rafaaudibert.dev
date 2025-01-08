const convertToHumanReadableDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
    })
}

export { convertToHumanReadableDate }