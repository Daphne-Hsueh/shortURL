const URLpart = document.querySelector('.URLpart');

function renderLongURL() {
  URLpart.innerHTML =  `
  <form onsubmit="triggerShorten(event)">
      <input type="url" size="30" id="input" placeholder="Insert original URL here">
      <button type="submit" class="shorten-button">shorten</button>
    </form>`
}

function renderShortURL(shortUrl) {
  URLpart.innerHTML = `
  <div class="shortUrlBlock">
    <h3> Here's your shortened URL! </h3>
    <div>
      <a href= "${shortUrl}"> ${shortUrl}</a>
      <button onclick="copyString('${shortUrl}')"><i class="fa-solid fa-copy" id="copy-btn"></i></button> 
    </div> 
  </div>
  <button onclick="renderLongURL()"> short another new link </button>`
}

async function triggerShorten(event) {
  const input = document.getElementById("input");
  const inputValue = input.value;
  if (inputValue) {
    event.preventDefault(); 
    await returnShortUrl(inputValue)
  } else {
    alert('please enter valid URL')
  }
}

async function returnShortUrl(longUrl) {
  try {
    const response = await axios.post('http://localhost:3000/return-short', {
      longUrl: longUrl
    });
    const shortUrl = response.data.shortUrl;
    renderShortURL(shortUrl);
  } catch (error) {
      console.error('Error:', error);
  }
}

function copyString(string) {
  navigator.clipboard.writeText(string).then(() => {
      console.log('Short URL successfully copied to clipboard');
    }).catch(err => {
      console.error('Failed to copy text: ', err);
    });
  const copyBtn = document.getElementById('copy-btn')
  copyBtn.classList.remove('fa-copy')
  copyBtn.classList.add('fa-check')
}

renderLongURL()