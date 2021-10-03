const puppeteer = require('puppeteer');
const editJsonFile = require('edit-json-file');

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    // My MAL (My Anime List) page. Change this if you want to use your own list.
    await page.goto('https://myanimelist.net/animelist/herrdanilo?status=6');

    // Goes all the way searching animes. 
    const listStats = await page.evaluate(() => {
        // Pick all by names.
        let animeNames = document.querySelectorAll(".data.title.clearfix");
        const names = [...animeNames];
        const namesList = names.map(id => id.innerText);
        const getLink = names.map(id => id.innerHTML);
        // Choose a random anime.
        const animeId = Math.floor(Math.random() * names.length + 1);
        const choosenAnime = namesList[animeId];
        const link = getLink[animeId];
        const anime = choosenAnime.slice(0, -11);
        
        return { choosenAnime, anime, link }
    })
    await browser.close();

    // Default options for json
    var newAnime = listStats.anime
    var aired = "Já terminou de lançar!"

    // Check if has video inbuilt
    if (newAnime.includes("Watch Episode Video")) {
        newAnime = newAnime.slice(0, -20);
    }

    // Check if anime is lauching or will be.
    if (newAnime.includes("Not Yet Aired")) {
        newAnime = newAnime.slice(0, -14);
        aired = "Ainda não lançou!"
    }
    if (newAnime.includes("Airing")) {
        newAnime = newAnime.slice(0, -7);
        aired = "Está em lançamento!"
    }

    // Link gathering.
    const firstIndex = listStats.link.indexOf('"');
    const firstLink = listStats.link.slice(firstIndex+1);
    const secondIndex = firstLink.indexOf('"');
    const secondLink = firstLink.slice(0, secondIndex);
    const finalLink = 'https://myanimelist.net' + secondLink;
    
    
    // I choose this way of showing the result because its more familiar to me.
    let anime = editJsonFile('anime.json');
    anime.set('nomeDoAnime', `${newAnime}`);
    anime.set('lançamento', `${aired}`);
    anime.set('linkDoAnime', `${finalLink}`);
    anime.save();
    anime = editJsonFile('anime.json', {
        autosave: true
    })

    console.log('choosenAnime=> ', listStats.choosenAnime);
    //console.log('link=> ', listStats.link);
})();