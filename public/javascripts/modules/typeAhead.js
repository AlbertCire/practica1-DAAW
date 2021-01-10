import axios from 'axios';
import dompurify from 'dompurify';

function searchResultsHTML(stays) {
    return stays.map(stay => {
        return `
            <a href="/stay/${stay.slug}" class="search__result">
                <strong>${stay.location}</strong>
            </a>
        `;
    }).join('');
}
function typeAhead(search) {
    if (!search) return;
 
    const searchInput = search.querySelector('input[location="search"]');
    const searchResults = search.querySelector('.search__results');
    
    searchInput.addEventListener('input', function(e) {
 
        //there is no input, hide div for search results
        if (!this.value) {
            searchResults.style.display = 'none';
            return;
        }

        //show the div for search results
        searchResults.style.display = 'block';
        
        console.log(`/api/v1/search?q=${this.value}`);
        axios.get(`/api/v1/search?q=${this.value}`)
            .then(res => {
                if (res.data.length) {
                    console.log(res.data);
                    const html = searchResultsHTML(res.data.stays);
                    searchResults.innerHTML = dompurify.sanitize(html);
                } else {
                    console.log('a',res.data);
                    searchResults.innerHTML = `
                        <div class="search__result">
                            <strong>No results found</strong>
                        </div>`;
                }
            })
            .catch(err => {
                console.log(err);
            });
    });

    searchInput.addEventListener('keyup', function(e) {
        //38 -> up, 40 -> down, 13 -> enter
        if (![38, 40, 13].includes(e.keyCode)) {
            return; //discarded
        }
        const current = search.querySelector('.search__result--active'); //if there is one selected, we capture it
        const items = search.querySelectorAll('.search__result');
        let next;
    
        if (e.keyCode === 40 && current) {
            next = current.nextElementSibling || items[0];
        } else if (e.keyCode === 40) {
            next = items[0];
        } else if (e.keyCode === 38 && current) {
            next = current.previousElementSibling || items[items.length1]; //UP and 1st -> go to last
        } else if (e.keyCode === 38) {
            next = items[items.length-1];
        } else if (e.keyCode === 13 && current.href) {
            window.location = current.href; //go to URL
            return;
        }

        if (current) {
            current.classList.remove('search__result--active');
        }
        next.classList.add('search__result--active');    
    });
    
}

export default typeAhead;