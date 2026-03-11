function calculateDuration(startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    let totalSeconds = (end - start) / 1000; 
  
    const days = Math.floor(totalSeconds / (3600 * 24)); 
    totalSeconds %= 3600 * 24; 
  
    const hours = Math.floor(totalSeconds / 3600); 
    totalSeconds %= 3600; 
  
    const minutes = Math.floor(totalSeconds / 60); 
  
    const durationString = [
      days > 0 ? `${days} d` : null,
      hours > 0 ? `${hours} hr` : null,
      minutes > 0 ? `${minutes} min` : null,
    ]
      .filter(Boolean)
      .join(" "); 
  
    return durationString || totalSeconds+"s"; 
}

function calculateDurationForArrayItems(arr){
    return arr.map(item => {
      if (Array.isArray(item)) {
        const firstObject = item[0]; 
        const lastObject = item[item.length - 1]; 
  
        const duration = calculateDuration(lastObject.dateFormated, firstObject.dateFormated);
        
        return {
          ...firstObject, 
          duration: duration 
        };
      }
  
      return item;
    });
}

module.exports = {
    calculateDurationForArrayItems,
    calculateDuration
}

