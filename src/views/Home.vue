<template>
    <div class="container">
        <h2 class="section-title">{{ $t('tui-jian') }}
            <span class="play-all-icon" ><i class="fas fa-compact-disc"></i></span>
        </h2>
        <div class="recommendations">
            <div class="recommend-card gradient-background">
                <div class="radio-card">
                    <div class="radio-left">
                        <div class="disc-container">
                            <img src="@/assets/images/home/radio-disc.png" class="radio-disc" alt="Radio disc">
                        </div>
                        <div class="decorative-box">
                            <div class="music-bars">
                                <div class="bar"></div>
                                <div class="bar"></div>
                                <div class="bar"></div>
                                <div class="bar"></div>
                            </div>
                        </div>
                        <div class="play-button" @click="playFM"></div>
                        <div class="note-container">
                            <transition-group name="fly-note">
                                <div v-for="note in flyingNotes" :key="note.id" class="flying-note" :style="note.style">
                                    ♪</div>
                            </transition-group>
                        </div>
                    </div>
                    <div class="radio-content gradient-background">
                        <div class="radio-title">
                            <span class="shuffle-icon" @click="toggleMode" >💖</span>
                            MoeKoe Radio
                            <span class="shuffle-icon" @click="toggleMode">{{ modeIcon }}</span>
                        </div>
                        <div class="radio-subtitle">{{ radioSubtitle }}</div>
                    </div>
                </div>
            </div>
            <div class="recommend-card">
                <router-link :to="{
                    path: '/Ranking'
                }" class="ranking-entry">
                    <div class="ranking-content">
                        <div class="ranking-icon">🏆</div>
                        <div class="ranking-decoration">
                            <div class="ranking-bar"></div>
                            <div class="ranking-bar"></div>
                            <div class="ranking-bar"></div>
                        </div>
                        <h3 class="ranking-title">排行榜</h3>
                        <div class="ranking-description">发现你的专属好歌</div>
                    </div>
                </router-link>
            </div>

            <div class="recommend-card">
                <div class="playlist-entry gradient-background">
                    <router-link :to="{
                        path: '/PlaylistDetail',
                        query: { global_collection_id: 'collection_3_25230245_24_0' }
                    }">
                        <div class="playlist-content">
                            <div class="playlist-icon">
                                <img src="@/assets/images/home/hutao.png" />
                            </div>
                            <div class="ranking-description">送给也喜欢音乐的你</div>
                        </div>
                    </router-link>
                </div>
            </div>
        </div>

        <h2 class="section-title">
            {{ $t('mei-ri-tui-jian') }}
            <span class="play-all-icon" @click="addAllSongsToQueue" title="虽然不明显，但你就当它是个彩蛋吧"><i class="fas fa-music"></i></span>
        </h2>
        <div v-if="isLoading" class="skeleton-loader">
            <div v-for="n in 16" :key="n" class="skeleton-item">
                <div class="skeleton-cover"></div>
                <div class="skeleton-info">
                    <div class="skeleton-line"></div>
                    <div class="skeleton-line short"></div>
                </div>
            </div>
        </div>
        <div v-else class="song-list">
            <div class="song-item" v-for="(song, index) in songs" :key="index"
                @click="playSong($getQuality(null, song), song.ori_audio_name, $getCover(song.sizable_cover, 480), song.author_name)"
                @contextmenu.prevent="showContextMenu($event, song)">
                <img :src="$getCover(song.sizable_cover, 64)" :alt="song.ori_audio_name" class="song-cover">
                <div class="song-info">
                    <div class="song-title">{{ song.ori_audio_name }}</div>
                    <div class="song-artist">{{ song.author_name }}</div>
                </div>
            </div>
        </div>
        <h2 class="section-title">{{ $t('tui-jian-ge-dan') }}
            <span class="play-all-icon"><i class="fas fa-list-ul"></i></span>
        </h2>
        <div class="playlist-grid">
            <div class="playlist-item" v-for="(playlist, index) in special_list" :key="index">
                <router-link :to="{
                    path: '/PlaylistDetail',
                    query: { global_collection_id: playlist.global_collection_id }
                }">
                    <img :src="$getCover(playlist.flexible_cover, 240)" class="playlist-cover">
                    <div class="playlist-info">
                        <div class="playlist-title">{{ playlist.specialname }}</div>
                        <div class="playlist-description">{{ playlist.intro }}</div>
                    </div>
                </router-link>
            </div>
        </div>
        <ContextMenu ref="contextMenuRef" :playerControl="playerControl" />
    </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { get } from '../utils/request';
import ContextMenu from '../components/ContextMenu.vue';

const songs = ref([]);
const special_list = ref([]);
const isLoading = ref(true);
const playSong = (hash, name, img, author) => {
    props.playerControl.addSongToQueue(hash, name, img, author);
};
const contextMenuRef = ref(null);
const showContextMenu = (event, song) => {
    if (contextMenuRef.value) {
        contextMenuRef.value.openContextMenu(event, {
            OriSongName: song.filename,
            FileHash: song.hash,
            cover: song.sizable_cover?.replace("{size}", 480) || './assets/images/ico.png',
            timeLength: song.time_length
        });
    }
};
const props = defineProps({
    playerControl: Object
});

const currentMode = ref('1');
const modes = ['1', '2', '3', '4', '6'];

const modeIcon = computed(() => {
    switch (currentMode.value) {
        case '1': return '💖';
        case '2': return '🎶';
        case '3': return '🔥';
        case '4': return '💎';
        case '6': return '👑';
        default: return '💖';
    }
});

const radioSubtitle = computed(() => {
    switch (currentMode.value) {
        case '1': return '私人专属好歌推荐';
        case '2': return '经典怀旧金曲精选';
        case '3': return '热门好歌随心听';
        case '4': return '小众宝藏佳作发现';
        case '6': return 'VIP专属音乐推荐';
        default: return '根据你的听歌喜好推荐';
    }
});

const toggleMode = () => {
    const currentIndex = modes.indexOf(currentMode.value);
    const nextIndex = (currentIndex + 1) % modes.length;
    currentMode.value = modes[nextIndex];
};

const flyingNotes = ref([]);
let noteId = 0;

const playFM = async (event) => {
    try {
        const playButton = event.currentTarget;
        const rect = playButton.getBoundingClientRect();
        const note = {
            id: noteId++,
            style: {
                '--start-x': `${rect.left + rect.width / 2}px`,
                '--start-y': `${rect.top + rect.height / 2}px`,
                'left': '0',
                'top': '0'
            }
        };
        flyingNotes.value.push(note);
        setTimeout(() => {
            flyingNotes.value = flyingNotes.value.filter(n => n.id !== note.id);
        }, 1500);

        const response = await get('/top/card', {
            params: {
                card_id: currentMode.value
            }
        });

        if (response.status === 1 && response.data?.song_list?.length > 0) {
            const newSongs = response.data.song_list.map(song => {
                return {
                    hash: song.hash,
                    name: song.songname,
                    cover: song.sizable_cover?.replace("{size}", 480),
                    author: song.author_name,
                    timelen: song.time_length
                }
            })
            props.playerControl.addPlaylistToQueue(newSongs);
        }
    } catch (error) {
        console.error('FM播放出错:', error);
    }
};

onMounted(() => {
    recommend();
    playlist();
});

const recommend = async () => {
    const response = await get('/everyday/recommend');
    if (response.status == 1) {
        songs.value = response.data.song_list;
    }
    isLoading.value = false;
}

const playlist = async () => {
    const response = await get(`/top/playlist?category_id=0`);
    if (response.status == 1) {
        special_list.value = response.data.special_list;
    }
}

const addAllSongsToQueue = () => {
    props.playerControl.addPlaylistToQueue(songs.value.map(song => ({
        hash: song.hash,
        name: song.ori_audio_name,
        cover: song.sizable_cover?.replace("{size}", 480),
        author: song.author_name,
        timelen: song.time_length
    })));
};

</script>

<style scoped>
.container {
    width: 100%;
    margin: 0 auto;
    /* padding: 20px; */
}

.section-title {
    font-size: 28px;
    font-weight: bold;
    margin-bottom: 30px;
    color: var(--primary-color);
    margin-left: 20px;
    letter-spacing: 2px; /* 设置文字间距为2像素 */
}

.recommendations {
    display: flex;
    gap: 3em;
    margin-bottom: 40px;
    margin:0 20px;
}

.recommend-card {
    flex: 1 1 calc(33.333% - 15px);
    height: 200px;
    display: flex;
    flex-wrap: wrap;
    border-radius: 15px;
    overflow: hidden;
    align-items: center;
    
    gap: 3em;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.recommend-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
}

.recommend-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 15px;
}

.play-icon {
    font-size: 30px;
    color: white;
    cursor: pointer;
}

.card-content {
    display: flex;
    align-items: center;
}

.song-list {
    display: flex;
    flex-wrap: wrap;
    gap: 20px 35px;
    max-width: 100%;
    margin-top: 20px;
    justify-content: center; /* 水平居中 */
    padding: 0 20px;
}

.song-item {
    flex: 1 1 calc(20% - 15px);
    display: flex;
    align-items: center;
    gap: 10px;
    background-color: #fff;
    padding: 10px;
    box-sizing: border-box;
    border-radius: 10px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    transition: transform 0.3s ease;
    cursor: pointer;
}

.song-item:hover {
    transform: translateY(-5px);
}

.song-cover {
    width: 60px;
    height: 60px;
    border-radius: 6px;
}

.song-info {
    display: flex;
    flex-direction: column;
}

.song-title {
    font-size: 16px;
    font-weight: bold;
    color: #333;
}

.song-artist {
    font-size: 14px;
    color: #666;
    width: 185px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.playlist-grid {
    display: flex;
    flex-wrap: wrap;
    justify-content: center; /* 水平居中 */
    gap: 30px; /* 设置间隙为15px */
    max-width: 100%; /* 确保容器宽度适应父元素 */
    padding: 0 20px;
}

.playlist-item {
    flex: 1 1 calc(20% - 30px); /* 使每个卡片占据25%的宽度，减去间隙的一半 */
    box-sizing: border-box; /* 确保padding和border不会影响盒模型的宽度 */
    background-color: #fff;
    border-radius: 10px;
    overflow: hidden;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    cursor: pointer;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    gap: 30px;
}

.playlist-item:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 20px var(--color-box-shadow);
}

.playlist-cover {
    width: 100%;
    aspect-ratio: 1;
    object-fit: cover;
}

.playlist-info {
    padding: 15px;
}

.playlist-title {
    font-weight: bold;
    margin-bottom: 5px;
    font-size: 16px;
    color: #333;
}

.playlist-description {
    color: #666;
    font-size: 14px;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
    max-height: 50px;
    line-height: 25px;
}

.skeleton-loader {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    margin-top: 10px;
}

.skeleton-item {
    display: flex;
    align-items: center;
    margin-bottom: 10px;
    width: 250px;
    border-radius: 10px;
    padding-left: 10px;
    background-color: #f0f0f0;
    height: 68px;
}

.skeleton-cover {
    width: 50px;
    height: 50px;
    margin-right: 10px;
    border-radius: 10px;
    background-color: #e0e0e0;
}

.skeleton-info {
    display: flex;
    flex-direction: column;
    justify-content: center;
    max-width: 190px;
}

.skeleton-line {
    height: 10px;
    background-color: #e0e0e0;
    margin-bottom: 5px;
    border-radius: 5px;
    width: 150px;
}

.radio-card {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    border-radius: 15px;
}

.radio-left {
    flex: 0;
    margin-top: 15px;
    margin-bottom: 8px;
    display: flex;
    align-items: center;
    width: 100%;
    justify-content: space-between;
}

.disc-container {
    position: relative;
    order: 1;
}

.radio-disc {
    width: 80px;
    height: 80px;
    object-fit: cover;
    border-radius: 50%;
    box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.2),
        inset 0 0 20px rgba(0, 0, 0, 0.1),
        0 2px 4px rgba(255, 255, 255, 0.8);
    border: 8px solid #e8eeff;
    padding: 2px;
    background: #fff;
}

.decorative-box {
    width: 60px;
    height: 60px;
    position: relative;
    background: linear-gradient(45deg, #f0f4ff, #ffffff);
    border-radius: 12px;
    transform: perspective(500px) rotateY(-15deg);
    transition: transform 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-left: 10px;
}

.music-bars {
    display: flex;
    align-items: flex-end;
    gap: 3px;
    height: 30px;
}

.bar {
    width: 3px;
    background: #4a90e2;
    border-radius: 3px;
    animation: sound-wave 1.2s ease-in-out infinite;
}

.bar:nth-child(1) {
    height: 15px;
    animation-delay: 0s;
}

.bar:nth-child(2) {
    height: 20px;
    animation-delay: 0.2s;
}

.bar:nth-child(3) {
    height: 12px;
    animation-delay: 0.4s;
}

.bar:nth-child(4) {
    height: 18px;
    animation-delay: 0.6s;
}

@keyframes sound-wave {

    0%,
    100% {
        transform: scaleY(1);
    }

    50% {
        transform: scaleY(0.5);
    }
}

.play-button {
    order: 3;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    transition: all 0.2s ease;
    margin-right: 20px;
    margin-top: -57px;
    position: relative;
    font-size: 20px;
    color: #333;
}

.play-button::after {
    content: '♪';
    transition: all 0.2s ease;
}

.play-button:hover {
    transform: scale(1.05);
    background: var(--primary-color);
    color: #fff;
}

.play-button:hover::after {
    border-color: none;
}

.play-button::after {
    border: none;
    margin-left: 0;
}

.radio-title {
    justify-content: center;
    font-size: 22px;
    font-weight: bold;
    color: white;
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
}

.heart-icon {
    font-size: 20px;
}

.shuffle-icon {
    font-size: 20px;
    color: #666;
    cursor: pointer;
    transition: transform 0.3s ease;
}

.shuffle-icon:hover {
    transform: scale(1.1);
    color: var(--primary-color);
}

.radio-subtitle {
    font-size: 15px;
    color: white;
    text-align: center;
}

.note-container {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    pointer-events: none;
    overflow: hidden;
}

.flying-note {
    position: absolute;
    font-size: 36px;
    color: var(--primary-color);
    pointer-events: none;
    transform-origin: center;
}

.fly-note-enter-active {
    animation: fly-note 2s ease-out forwards;
}

.fly-note-leave-active {
    animation: fly-note 2s ease-out forwards;
}

@keyframes fly-note {
    0% {
        transform: translate(var(--start-x), calc(var(--start-y) - 50px)) rotate(0deg) scale(1.2);
        opacity: 0.9;
    }

    20% {
        transform: translate(calc(var(--start-x) + 20px), calc(var(--start-y) - 70px)) rotate(45deg) scale(1.3);
        opacity: 0.85;
    }

    100% {
        transform: translate(80vw, 100vh) rotate(360deg) scale(0.6);
        opacity: 0;
    }
}

.ranking-entry {
    display: block;
    width: 100%;
    height: 100%;
    text-decoration: none;
    background: linear-gradient(135deg, var(--primary-color), #6c5ce7);
    border-radius: 15px;
    overflow: hidden;
}

.ranking-content {
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: white;
    position: relative;
}

.ranking-icon {
    font-size: 48px;
    margin-bottom: 15px;
}

.ranking-title {
    font-size: 24px;
    font-weight: bold;
    margin-bottom: 10px;
    margin-top: 0px;
}

.ranking-description {
    font-size: 16px;
    opacity: 0.9;
}

.ranking-decoration {
    display: flex;
    gap: 8px;
    align-items: flex-end;
}

.ranking-bar {
    width: 6px;
    background: rgba(255, 255, 255, 0.8);
    border-radius: 3px;
    animation: rankingBars 1.5s ease-in-out infinite;
}

.ranking-bar:nth-child(1) {
    height: 20px;
    animation-delay: 0s;
}

.ranking-bar:nth-child(2) {
    height: 30px;
    animation-delay: 0.2s;
}

.ranking-bar:nth-child(3) {
    height: 25px;
    animation-delay: 0.4s;
}

@keyframes rankingBars {

    0%,
    100% {
        transform: scaleY(1);
    }

    50% {
        transform: scaleY(0.7);
    }
}

.recommend-card.gradient-background {
    background: linear-gradient(135deg, #6c5ce7, #f8a3d1);
    color: white;
}

.playlist-entry {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    border-radius: 15px;
    background: linear-gradient(135deg, #6c5ce7, #f8a3d1);
    color: white;
    text-align: center;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.playlist-entry:hover {
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
}

.playlist-content {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    height: 100%;
    justify-content: flex-end;
}

.playlist-icon {
    width: 144px;
    height: 144px;
}

.playlist-icon img {
    width: 100%;
    height: 100%;
}

.play-all-icon {
    cursor: pointer;
    font-size: 26px;
    color: var(--order-color);
    transition: transform 0.2s ease;
}

</style>