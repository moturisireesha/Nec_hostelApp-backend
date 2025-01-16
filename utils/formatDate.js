exports.formatDateWithTime = (date) => {
  // Day, month, year
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are zero-based
  const year = date.getFullYear();

  // Hours, minutes, AM/PM
  let hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";

  hours = hours % 12;
  hours = hours ? hours : 12; // The hour '0' should be '12'

  // Replace the string in the desired format
  return ` ${day}-${month}-${year} ${hours}:${minutes} ${ampm}`;
};

exports.formatDate = (date) => {
  // Day, month, year
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are zero-based
  const year = date.getFullYear();
  // console.log(`${day}-${month}-${year}`);
  return `${day}-${month}-${year}`;
};

exports.formatTime = (date) => {
  // Hours, minutes, AM/PM
  let hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  hours = hours ? hours : 12; // The hour '0' should be '12'
  // console.log(`${hours}:${minutes} ${ampm}`);

  return `${hours}:${minutes} ${ampm}`;
};
