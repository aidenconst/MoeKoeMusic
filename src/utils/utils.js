export const applyColorTheme = (theme) => {
    let colors;
    if (theme === 'blue') {
        colors = {
            '--primary-color': '#4A90E2',
            '--order-color':'#7baae0',
            '--secondary-color': '#AEDFF7',
            '--background-color': '#FFF0F5',
            '--color-primary': '#2A6DAF',
            '--color-secondary-bg-for-transparent': 'rgba(174, 223, 247, 0.28)',
            '--color-box-shadow': 'rgba(74, 144, 226, 0.2)',
        };
    } else if (theme === 'green') {
        colors = {
            '--primary-color': '#52c41a',
            '--order-color':'#96d278',
            '--secondary-color': '#ceedbf',
            '--background-color': '#FFF0F5',
            '--color-primary': '#28A745',
            '--color-secondary-bg-for-transparent': 'rgba(167, 243, 208, 0.28)',
            '--color-box-shadow': 'rgba(83, 196, 26, 0.2)',
        };
    } else if (theme === 'orange') {
        colors = {
            '--primary-color': '#ff6b6b',
            '--order-color':'#fc8383',
            '--secondary-color': '#FFB6C1',
            '--background-color': '#FFF0F5',
            '--color-primary': '#fc4141',
            '--color-secondary-bg-for-transparent': 'rgba(209, 209, 214, 0.28)',
            '--color-box-shadow': 'rgba(255, 105, 180, 0.2)',
        };
    } else {
        colors = {
            '--primary-color': '#F74D69',
            '--order-color':'#f27689',
            '--secondary-color': '#f791a1',
            '--background-color': '#FFF0F5',
            '--color-primary': '#ba3045',
            '--color-secondary-bg-for-transparent': 'rgba(209, 209, 214, 0.28)',
            '--color-box-shadow': 'rgba(247, 77, 105, 0.2)',
        };
    }

    Object.keys(colors).forEach(key => {
        document.documentElement.style.setProperty(key, colors[key]);
    });
};


export const getCover = (coverUrl, size) => {
    if (!coverUrl) return './assets/images/ico.png';
    return coverUrl.replace("{size}", size);
};

export const getQuality = (hashs, data) => {
    const savedConfig = JSON.parse(localStorage.getItem('settings'));
    if(savedConfig?.quality === 'high'){
        if(hashs){
            return hashs[1]?.hash || hashs[0].hash;
        }
        return data['hash_320'] || data['hash_192'] || data['hash_128'] || data['hash'];
    }else if(savedConfig?.quality === 'lossless'){
        if(hashs){
            return hashs[hashs.length - 1]?.hash || hashs[1]?.hash || hashs[0].hash;
        }
        return data['hash_flac'] || data['hash_ape'] || data['hash'];
    }else if(savedConfig?.quality === 'hires'){
        if(hashs){
            return hashs[hashs.length - 1]?.hash;
        }
        return data['hash_flac'] || data['hash_sq'] || data['hash_ape'] || data['hash'];
    }
    if(hashs){
        return hashs[0].hash;
    }
    return data['hash'];
}

export const formatMilliseconds = (time) => {
    const milliseconds = time > 3600 ? time : time * 1000;
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}分${seconds}秒`;
};

export const setTheme = (theme) => {
    const html = document.documentElement;
    const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');

    const applyTheme = (isDark) => {
        if (isDark) {
            html.classList.add('dark');
        } else {
            html.classList.remove('dark');
        }
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
    };

    switch (theme) {
        case 'dark':
            applyTheme(true);
            break;
        case 'light':
            applyTheme(false);
            break;
        case 'auto':
            applyTheme(prefersDarkScheme.matches);
            prefersDarkScheme.addEventListener('change', (e) => {
                applyTheme(e.matches);
            });
            break;
    }
};