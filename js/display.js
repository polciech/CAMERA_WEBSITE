async function getImageData() {
    let url = 'http://127.0.0.1:5000/image_data';
    try {
        let res = await fetch(url);
        return await res.json();
    } catch (error) {
        console.log(error);
    }
}

async function renderUsers() {
    let imageData = await getImageData();
  
    // Group images by date using reduce
    const groupedImages = imageData.reduce((groups, image) => {
      // Parse the date string into a Date object
      const date = new Date(image.date);
  
      // Format the date for display using toLocaleDateString
      const dateString = date.toLocaleDateString();
      groups[dateString] = groups[dateString] || [];
      groups[dateString].push(image);
      return groups;
    }, {});
  
    let html = '';
  
    // Loop through grouped images and create HTML structure
    for (const date in groupedImages) {
      html += `
        <div class="row_group">
          <h4>${date}</h4>
          <div class="container">
      `;
  
      groupedImages[date].forEach(image => {
        html += `
            <div class="image">
              <a href="check.html?image=${image.name}">
                <img src="uploads/${image.name}" alt="${image.name}">
              </a>
            </div>
        `;
      });
  
      html += `
          </div>
        </div>
      `;
    }
  
    let container = document.querySelector('.col-7');
    container.innerHTML = html;
  }
  
  

renderUsers();