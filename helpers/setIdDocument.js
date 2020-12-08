const setId = (index) => new Promise((resolve, reject) => {  
        let dokIdIndex = '' + index;

        while (dokIdIndex.length < 8) {
            dokIdIndex = '0' + dokIdIndex;
        }
        resolve(dokIdIndex);
    })

module.exports = setId;