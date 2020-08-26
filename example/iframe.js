const getRow = (n, type) => {
    return `
    <tr>
    ${Array.apply(null, Array(n))
        .map(() => '<td><iframe src="./mutexLoop.html#' + type + '"></iframe></td>')
        .join('\n')}
    </tr>
    `;
};

const init = () => {
    const type = location.hash || 'indexeddb';
    let body = '<table>';
    for (let i = 0; i < 6; ++i) {
        body += getRow(4, type);
    }
    body += '</table>';
    document.body.innerHTML = body;
};

document.addEventListener('DOMContentLoaded', init);
