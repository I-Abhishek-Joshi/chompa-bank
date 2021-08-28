let button = document.querySelector('button');
let bodyContainer = document.querySelector('.table-content');
let tableFooter = document.querySelector('.table-footer');

let selectCities = document.querySelector('#selectCities')
let cities = document.querySelector('#cities')
let cityOptions = document.querySelectorAll('.cityOptions')

let selectQuery = document.querySelector('#selectQuery')
let queries = document.querySelector('#queries')
let queryOptions = document.querySelectorAll('.queryOptions')

let querySearch = document.querySelector('#querySearch')
let search = document.querySelector('#search')

let loading = document.querySelector('.loading');
let modalContainer = document.querySelector('.modal-container');
let cross = document.querySelector('#cross');
  

let currCity = 'MUMBAI', currQuery = 'Select Category', currPageNumber = 1;





 let wrapUp = (container, tempClass) => {
    document.querySelector(`${tempClass} .up`).classList.add('hide');
    document.querySelector(`${tempClass} .down`).classList.remove('hide');
    container.classList.add('hide');
 }
selectCities.addEventListener('click', (e) => {
    e.stopPropagation();
    document.querySelector('.dropdown-cities .down').classList.toggle('hide');
    document.querySelector('.dropdown-cities .up').classList.toggle('hide');
    cities.classList.toggle('hide');
})
for(let cityOption of cityOptions){
    cityOption.addEventListener('click', (e) => {
        e.stopPropagation();
        let tempCity = cityOption.children[0].innerText;
        selectCities.children[0].innerText = tempCity;
        wrapUp(cities, '.dropdown-cities');

    })
}

selectQuery.addEventListener('click', (e) => {
    e.stopPropagation();
    document.querySelector('.dropdown-queries .down').classList.toggle('hide');
    document.querySelector('.dropdown-queries .up').classList.toggle('hide');
    queries.classList.toggle('hide');
})
for(let queryOption of queryOptions){
    queryOption.addEventListener('click', (e) => {
        e.stopPropagation();
        let tempQuery = queryOption.children[0].innerText;
        selectQuery.children[0].innerText = tempQuery;
        wrapUp(queries, '.dropdown-queries');
    })
}
window.addEventListener('click', () => {
    wrapUp(cities, '.dropdown-cities');
    wrapUp(queries, '.dropdown-queries');
})




let getBanks = async () => {
    try{
        let response = await fetch(`https://vast-shore-74260.herokuapp.com/banks?city=${currCity.toUpperCase()}`);
        let data = await response.json();
        return data;
    }catch{
        return null;
    }
}

let fillContent = (perPage, currPage) => {

    currPage--;
    let filterData = JSON.parse(localStorage.getItem('filterData'));
    bodyContainer.innerHTML = '';
    if(filterData.length === 0){
        return;
    }
    let content = '';
    content +=`<thead>
        <tr>
            <th>Bank Name</th>
            <th>IFSC</th>
            <th>Bank Address</th>
            <th>Branch</th>
            <th>District</th>
            <th>State</th>
        </tr>
    </thead>`;
    content += `<tbody>`;
    for(let i = currPage * perPage; i < Math.min(currPage * perPage + perPage, filterData.length); i++){
        content += `
        <tr>
        <td>${filterData[i].bank_name}</td>
        <td>${filterData[i].ifsc}</td>
        <td>${filterData[i].address}</td>
        <td>${filterData[i].branch}</td>
        <td>${filterData[i].district}</td>
        <td>${filterData[i].state}</td>
    </tr>`;
    }
    content += `</tbody>`;
    bodyContainer.innerHTML = content;
}

let fillButtons = (perPage,currPage) => {
    tableFooter.innerHTML = '';
    let filterData = JSON.parse(localStorage.getItem('filterData'));
    if(filterData.length === 0){
        document.querySelector('.empty').classList.remove('hide');
        return;
    }
    document.querySelector('.empty').classList.add('hide');
    let total = Math.ceil(filterData.length / perPage);
    let start = Math.max(currPage - 2, 1);
    let end = Math.min(currPage + 2, total);

    if(end - start + 1 < 5 && total - end > 0){
        end += Math.min(total - end, 5 - (end - start + 1));
    }
    if(end - start + 1 < 5 &&  start > 0){
        start -= Math.min(start - 1, 5 - (end - start + 1));
    }
    let content = '';
    content += `<div class="pages">
        <div class="pageNoBig" id="previous">
            <p>Previous</p>
        </div>`;
    for(let i = start; i <= end; i++){
        content += `
        <div class="pageNoSmall">
            <p>${i}</p>
        </div>`;
    }
    content += `<div class="pageNoBig" id="next">
        <p>Next</p>
        </div>
        </div>
        <div class="pageInput">
        <input type="number" value="10">
        </div>`;

    tableFooter.innerHTML += content;
    let previous = document.querySelector('#previous');
    let next = document.querySelector('#next');
    if(currPage === 1 ){
        previous.classList.add('disable');
    }else{
        previous.classList.remove('disable');
    }

    if(currPage === total){
        next.classList.add('disable');
    }else{
        next.classList.remove('disable');
    }
    
}

let filterData = () => {
    let banks = JSON.parse(localStorage.getItem('data'));
    let filterData = [];
    for(let bank of banks){
        if(currQuery === 'Select Category'){
            filterData.push(bank);
        }else{
            if(currQuery === 'IFSC' && bank.ifsc.toUpperCase().includes(querySearch.value.toUpperCase().trim())){
                filterData.push(bank);
            }
            else if(currQuery === 'Branch' && bank.branch.toUpperCase().includes(querySearch.value.toUpperCase().trim())){
                filterData.push(bank);
            }
            else if(currQuery === 'Bank Name' && bank.bank_name.toUpperCase().includes(querySearch.value.toUpperCase().trim())){
                filterData.push(bank);
            }
        }
    }
    localStorage.setItem('filterData', JSON.stringify(filterData));
}



let callApi = async() => {
    if(localStorage.getItem('data') === null){
        const data = await getBanks();
        localStorage.setItem('data', JSON.stringify(data));
        filterData();
    }else{
        filterData();
    }
}



let displayInitial = async() => {
    loading.classList.remove('hide');
    document.querySelector('.all-table-content').classList.add('stop-scroll');
    modalContainer.classList.remove('hide');
    await callApi();
    fillContent(10, 1); 
    fillButtons(10, 1);
    loading.classList.add('hide');
    document.querySelector('.all-table-content').classList.remove('stop-scroll');
    modalContainer.classList.add('hide');



}

window.addEventListener('DOMContentLoaded', () => {
    displayInitial();
})

document.querySelector('.table-footer').addEventListener('click', (e) => {
    let filterData = JSON.parse(localStorage.getItem('filterData'));
    totalPages = Math.ceil(filterData.length / 10);
    if(e.target.innerText === 'Next' && currPageNumber < totalPages){
        currPageNumber++;
        fillContent(10, currPageNumber);
        fillButtons(10, currPageNumber);
    }
    else if(e.target.innerText === 'Previous' && currPageNumber > 1){
        currPageNumber--;
        fillContent(10, currPageNumber);
        fillButtons(10, currPageNumber);
    }else if(Number(e.target.innerText)){
        currPageNumber = Number(e.target.innerText);
        fillContent(10, currPageNumber);
        fillButtons(10, currPageNumber);

    }
});
search.addEventListener('click', () => {
    
    if(currCity.toLocaleUpperCase() !== selectCities.children[0].innerText.toUpperCase()){
        currCity = selectCities.children[0].innerText;
        localStorage.removeItem('data');
        localStorage.removeItem('filterData');
        displayInitial();

    }else{
        currQuery = selectQuery.children[0].innerText;
        filterData();
        fillContent(10, 1);
        fillButtons(10, 1);
    }
    
})

bodyContainer.addEventListener('click', (e) => {
    let bank = e.target.parentElement.children;
    let modal = document.querySelector('#modalContent');
    modal.innerHTML = `<p><strong>Bank Name</strong>: ${bank[0].innerText}</p>
    <p><strong>IFSC</strong>:${bank[1].innerText}</p>
    <p><strong>Bank Address</strong>: ${bank[2].innerText} </p>
    <p><strong>Branch</strong>: ${bank[3].innerText}</p>
    <p><strong>District</strong>:${bank[4].innerText}</p>`;

    document.querySelector('.all-table-content').classList.add('stop-scroll');
    document.querySelector('.modal-container').classList.remove('hide');
    document.querySelector('.modal-body').classList.remove('hide');

})
cross.addEventListener('click', () => {
    document.querySelector('.modal-container').classList.add('hide');
    document.querySelector('.modal-body').classList.add('hide');
    document.querySelector('.all-table-content').classList.remove('stop-scroll');

})