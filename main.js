const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const PLAYER_STO_KEY = 'F8-Player'

// const playlist = $('.playlist');
const cd = $('.cd')

const heading = $('header h2')
const cdThumb = $('.cd-thumb')
const audio = $('#audio')

const playBtn = $('.btn-toggle-play')
const player = $('.player')
const progress = $('#progress') //thanh chạy nhạc

const prevBtn = $('.btn-prev')
const nextBtn = $('.btn-next') 

const randomBtn = $('.btn-random')

const repeatBtn = $('.btn-repeat')

const playlist = $('.playlist')

const app = {
    currentIndex: 0,
    isPlaying: false,
    isRandom: false,
    isRepeat: false,
    config: JSON.parse(localStorage.getItem(PLAYER_STO_KEY)) || {},

    songs: [
        {
            name: 'Chạy Về Khóc Với Anh',
            singer: 'Erik',
            path: './assets/music/Chay-Ve-Khoc-Voi-Anh-ERIK.mp3',
            img: './assets/img/chayvekhocvoianh.jpg'
        },
        {
            name: 'Cưới Thôi',
            singer: 'Bray',
            path: './assets/music/CuoiThoi.mp3',
            img: './assets/img/cuoithoi.jpg'
        },
        {
            name: 'Don\'t Break My Heart',
            singer: 'Binz',
            path: './assets/music/Don-t-Break-My-Heart.mp3',
            img: './assets/img/dontbreakmyheart.jpg'
        },
        {
            name: 'Độ Tộc 2',
            singer: 'Mixi, Phúc Du',
            path: './assets/music/Do-Toc-2.mp3',
            img: './assets/img/dotoc2.jpg'
        },
        {
            name: 'Tháng 4 Là Lời Nói Dối Của Em',
            singer: 'Hà Anh Tuấn',
            path: './assets/music/Thang-Tu-La-Loi-Noi-Doi-Cua-Em.mp3',
            img: './assets/img/thang4laloinoidoicuaem.jpg'
        }

    ],
    setConfig: function(key, val) {
        this.config[key] = val;
        localStorage.setItem(PLAYER_STO_KEY, JSON.stringify(this.config)) //set them vao
    },
    render: function(){
        const htmls = this.songs.map((song,index) => { //thêm lệnh vào html -> thấy ds bài
            return `
            <div class="song ${index === this.currentIndex ? 'active' : ''}" data-index="${index}">
                <div class="thumb" 
                    style="background-image: url('${song.img}')">
                </div>
                <div class="body">
                    <h3 class="title">${song.name}</h3>
                    <p class="author">${song.singer}</p>
                </div>
                <div class="option">
                    <i class="fas fa-ellipsis-h"></i>
                </div>
            </div>
            `
        })
        playlist.innerHTML = htmls.join(''); //render bài hát
    },
    defineProperties: function() {//định nghĩa thuộc tính
        Object.defineProperty(this, 'currentSong', {
            get: function() {
                return this.songs[this.currentIndex]
            }
        })
    },
    handleEvents: function() {
        const _this = this
        const cdWidth = cd.offsetWidth //lấy ra chiều ngang

        // Xử lý CD quay/ dừng
        const cdThumbAnimate = cdThumb.animate([
            { transform: 'rotate(360deg)'} //quay 
        ], {
            duration: 10000, // 10 seconds
            iterations: Infinity, //số lần lặp
        })
        cdThumbAnimate.pause();

        //Xử lý phóng to/ thu nhỏ CD
        document.onscroll = function(){//nghe khi kéo mouse
            // console.log(window.scrollY) //Y là trục dọc
            // console.log(document.documentElement.scrollTop) //documentElement: Ele thẻ HTML
            const scrollTop = window.scrollY || document.documentElement.scrollTop
            const  newCdWidth = cdWidth - scrollTop

            cd.style.width = newCdWidth>0 ? newCdWidth + 'px': 0 //thu nhỏ khi cuộn
            cd.style.opacity = newCdWidth / cdWidth
        }

        //Xử lý khi click play
        playBtn.onclick = function() {
            if (_this.isPlaying) {
               // _this.isPlaying = false
                audio.pause()
              //  player.classList.remove('playing') //để thêm vào CSS tạo icon dừng
            } else {
               // _this.isPlaying = true
                audio.play()
               // player.classList.add('playing') //để thêm vào CSS tạo icon đang chạy
            }
            
        }

        //Khi song được play
        audio.onplay = function() {
            _this.isPlaying = true  
            player.classList.add('playing') //để thêm vào CSS tạo icon đang chạy
            cdThumbAnimate.play()
        }

        //Khi song được pause
        audio.onpause = function() {
            _this.isPlaying = false  
            player.classList.remove('playing') //để thêm vào CSS tạo icon dừng
            cdThumbAnimate.pause()
        }

        //Khi tiến độ bài hát thay đổi
        audio.ontimeupdate = function() {
            if(audio.duration){
                const progressPercent = Math.floor(audio.currentTime / audio.duration * 100) //làm tròn
                progress.value = progressPercent
            }
            //console.log(audio.currentTime / audio.duration * 100)
        }

        //Xử lý khi tua song
        progress.onchange = function(e) {
            const seekTime = audio.duration / 100 * e.target.value //time để tua
            audio.currentTime = seekTime
           
        }

        //Khi next Song
        nextBtn.onclick = function() {
            if(_this.isRandom){
                _this.playRandomSong();
            } else {
                _this.nextSong();
            }
            //_this.nextSong();
            audio.play();
            _this.render();
            _this.scrollToActiveSong();
        }

        // //Khi prev Song
        prevBtn.onclick = function() {
            if(_this.isRandom){
                _this.playRandomSong();
            } else {
                _this.prevSong();
            }
            //_this.prevSong();
            audio.play();
            _this.render();
            _this.scrollToActiveSong();

        }

        //Xử lý bật / tắt random song
        randomBtn.onclick = function(e) {
            _this.isRandom = !_this.isRandom
            // randomBtn.classList.add('active')
            _this.setConfig('isRandom', _this.isRandom)
            randomBtn.classList.toggle('active',_this.isRandom)
        }

        //Xử lý lặp lại 1 song
        repeatBtn.onclick = function(e) {
            _this.isRepeat = !_this.isRepeat;
            _this.setConfig("isRepeat", _this.isRepeat);
            repeatBtn.classList.toggle("active", _this.isRepeat);
        }

        //Xử lý next song khi audio ended
        audio.onended = function() {
            if(_this.isRepeat){
                audio.play();
            } else {
                nextBtn.click();
            }
        }

        //Lắng nghe hành vi click vào playlist
        playlist.onclick = function(e) {
            // console.log(e.target); //e = event; target = cái định click vào
            const songNote = e.target.closest('.song:not(.active)')
            if(songNote || e.target.closest('.option')) {//closest trả về element: chính nó || cha nó || null
                // console.log(e.target);
                //Xử lý khi click vào song
                if(songNote) {
                   _this.currentIndex = Number(songNote.dataset.index);
                   _this.loadCurrentSong();
                   audio.play();
                   _this.render();
                }

                //Xử lý khi click vào song option
                if (e.target.closest('.option')) {

                }
            }
        }

    },

    scrollToActiveSong: function() {
        setTimeout(() => {
            $('.song.active').scrollIntoView({
                behavior: 'smooth',
                block: 'nearest',
            });
        }, 300);
    },

    loadCurrentSong: function() {
        
        heading.textContent = this.currentSong.name
        cdThumb.style.backgroundImage = `url('${this.currentSong.img}')`
        audio.src = this.currentSong.path

        console.log(heading, cdThumb, audio)
    },

    loadConfig: function() {
        this.isRandom = this.config.isRandom
        this.isRepeat = this.config.isRepeat

    },

    nextSong: function() {
        this.currentIndex++
        if(this.currentIndex >= this.songs.length) {
            this.currentIndex = 0
        }
        this.loadCurrentSong()
    } ,

    prevSong: function() {
        this.currentIndex--
        if(this.currentIndex < 0) {
            this.currentIndex = this.songs.length - 1
        }
        this.loadCurrentSong()
    } ,

    playRandomSong: function() {
        let newIndex
        do {
           newIndex = Math.floor(Math.random() * this.songs.length)
        }while (newIndex === this.currentIndex)

        this.currentIndex = newIndex
        this.loadCurrentSong()

    },

    start: function(){ //phương thức start
        //Gán cấu hình từ config  vào ứng dụng
        this.loadConfig()

        //Định nghĩa các thuộc tính cho Object
        this.defineProperties()

        //lắng nghe/Xử lý các events (DOM events)
        this.handleEvents()

        //tải thông tin bài hát đầu tiên vào UI khi chạy ứng dụng
        this.loadCurrentSong()

        //render playlist
        this.render()

        //Hiển thị trạng thái ban đầu của btn random, repeat
        randomBtn.classList.toggle('active',_this.isRandom)
        repeatBtn.classList.toggle('active',_this.isRepeat)
    }
}

app.start()
