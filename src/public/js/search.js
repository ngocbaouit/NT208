const searchInput = document.querySelector('#search');

const results_body = document.querySelector('#results');

document.getElementById('search').addEventListener('input', () => {
    document.getElementById('wr').style.display = 'none';
    document.getElementById('results').style.display = 'block';
});

load_data();

function load_data(query = '') {
    const request = new XMLHttpRequest();

    request.open('GET', `/search?q=${query}`);

    request.onload = () => {

        const results = JSON.parse(request.responseText);

        let html = '';

        if (results.length > 0) {
            results.forEach(result => {
                html += `
                    <div class="newsItem" href="`+ result.LINK + `">
                        <div class="newsImage">
                            <img src="`+ result.IMAGE + `" alt="">
                        </div>
                        <div class="newsContent">
                
                            <h2>`+ result.NAME + `</h2>
                            <p>`+ result.INTRODUCE + `</p>
                            <a href="`+ result.LINK + `" target="_blank">Read More</a>
                        </div>
                    </div>
                `;
            });
        }
        else {
            html += `                
                <h3 class="NoData">No Data Found</h3>         
            `;
        }

        results_body.innerHTML = html;

    };

    request.send();
}

searchInput.addEventListener('input', () => {

    const query = searchInput.value;

    load_data(query);

});