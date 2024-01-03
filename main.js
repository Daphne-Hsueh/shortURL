const URLpart = document.querySelector('.URLpart');

function renderOldURL() {
  URLpart.innerHTML = ` 
  <div> 
    <input type="url" size="30" placeholder="Input original URL here">
    <button class="shorten-button">shorten</button> 
  </div>`
}

function renderNewURL(shortenLink) {
  URLpart.innerHTML = `
  <h3> Here's your shortened URL! </h3>
  <div>
    <a href= ${shortenLink}> ${shortenLink}</a>
    <button class="copy-button">copy</button> 
  </div> `
}





