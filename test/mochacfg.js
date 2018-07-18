['.zip', '.pn'].forEach(ext => {
    require.extensions[ext] = () => null;
});