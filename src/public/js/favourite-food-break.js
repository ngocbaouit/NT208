const hearts = document.querySelectorAll(".heart");
const animations = document.querySelectorAll(".animation-heart");

(async function fetchAndMarkFavouriteFoods() {
    await markFavouriteFoods();
})();

document.addEventListener('DOMContentLoaded', () => {
    hearts.forEach((heart, index) => {
        heart.addEventListener('mousedown', async (event) => {
            const card = event.target.closest(".card-course-item");
            const SLUG = card.getAttribute('data-slug');
            const NAME = card.getAttribute('data-name');
            const IMAGE = card.getAttribute('data-image');

            requestAnimationFrame(() => {
                animations[index].classList.add('animation');
                heart.classList.add('fill-color');
            });

            await postData('/v1/FavouriteFoodBreak', { SLUG, NAME, IMAGE });
        });
    });

    animations.forEach((animation, index) => {
        animation.addEventListener('mousedown', async (event) => {
            const card = event.target.closest(".card-course-item");
            const heart = card.querySelector(".heart");
            const SLUG = card.getAttribute('data-slug');
            const NAME = card.getAttribute('data-name');
            const IMAGE = card.getAttribute('data-image');

            requestAnimationFrame(() => {
                animation.classList.remove('animation');
                heart.classList.remove('fill-color');
            });

            await postData('/v1/FavouriteFoodBreak', { SLUG, NAME, IMAGE });
        });
    });
});

async function markFavouriteFoods() {
    try {
        const response = await fetch('/v1/GetFavouriteFoodBreak');
        const favouriteFoods = await response.json();

        hearts.forEach((heart, index) => {
            const card = heart.closest(".card-course-item");
            const SLUG = card.getAttribute('data-slug');
            const food = favouriteFoods.find(food => food.SLUG === SLUG);

            requestAnimationFrame(() => {
                if (food) {
                    animations[index].classList.add('animation');
                    heart.classList.add('fill-color');
                } else {
                    animations[index].classList.remove('animation');
                    heart.classList.remove('fill-color');
                }
            });
        });
    } catch (error) {
        console.error('There was an error fetching favourite foods!', error);
    }
}

async function postData(url = '', data = {}) {
    try {
        const response = await fetch(url, {
            method: 'POST',
            mode: 'cors',
            cache: 'no-cache',
            credentials: 'same-origin',
            headers: {
                'Content-Type': 'application/json'
            },
            redirect: 'follow',
            referrerPolicy: 'no-referrer',
            body: JSON.stringify(data)
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();
        console.log('Success:', result);
    } catch (error) {
        console.error('There was an error!', error);
    }
}
