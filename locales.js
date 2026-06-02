const locales = {
  en: {
    // UI Main Menu (index.html)
    menu_play: "Play",
    menu_guest: "Guest Mode",
    menu_login: "Login",
    menu_back: "Back",
    menu_settings: "Settings",
    menu_join_server: "JOIN SERVER",
    menu_char_name: "Character Name",
    menu_password: "Password",
    menu_join: "Join",
    menu_cancel: "Cancel",
    menu_signup: "Sign Up",
    menu_login_title: "WELCOME BACK",
    menu_confirm_password: "Confirm Password",
    txt_missing_fields: "Please enter a username and password!",
    txt_profane: "Profanity is not allowed in names or passwords.",
    plc_hero: "e.g. Hero",

    // Skins
    skin_rainbow_name: "Default Hero", skin_rainbow_desc: "The standard hero.",
    skin_peasant_name: "Peasant Boy", skin_peasant_desc: "A humble beginning.",
    skin_adv_name: "Adventurer", skin_adv_desc: "Ready for a journey.",
    skin_stone_name: "Stone Armor", skin_stone_desc: "Solid and blocky.",
    skin_knight_name: "Iron Knight", skin_knight_desc: "Sturdy iron defenses.",
    skin_mage_name: "Apprentice Mage", skin_mage_desc: "Mystical powers.",
    skin_glow_name: "Neon Miner", skin_glow_desc: "A glowing run style.",
    skin_ninja_name: "Shadow Ninja", skin_ninja_desc: "Swift and silent.",
    skin_robot_name: "Mecha Suit", skin_robot_desc: "Futuristic combat armor.",
    skin_gold_name: "Golden Knight", skin_gold_desc: "Shiny and expensive.",
    skin_diamond_name: "Diamond Armor", skin_diamond_desc: "Unbreakable.",
    skin_fire_name: "Flame Lord", skin_fire_desc: "Burns with inner fire.",
    skin_ice_name: "Frost Warden", skin_ice_desc: "Cold as ice.",
    skin_phantom_name: "Phantom Assassin", skin_phantom_desc: "Barely visible.",
    skin_alien_name: "Extraterrestrial", skin_alien_desc: "From another world.",
    skin_demon_name: "Demon King", skin_demon_desc: "Fearsome ruler.",
    skin_angel_name: "Seraphim", skin_angel_desc: "Divine presence.",
    skin_dragon_name: "Dragon Tamer", skin_dragon_desc: "Commands the beasts.",
    skin_void_name: "Void Walker", skin_void_desc: "Consumes light.",
    skin_celestial_name: "Celestial Being", skin_celestial_desc: "Made of stardust.",
    skin_god_name: "Math God", skin_god_desc: "The ultimate form.",

    // UI Game.html
    title_hub: "Game Hub",
    welcome: "Welcome back, Hero!",
    btn_start: "⚔️ Enter Cave",
    btn_shop: "🛍️ Merchant",
    btn_achievements: "🏆 Trophies",
    btn_buff_index: "📖 Buff Index",
    btn_leaderboard: "📊 Rankings",
    btn_settings: "⚙️ Settings",
    btn_versus: "Versus Mode",
    btn_logout: "Logout",
    btn_main_menu: "Main Menu",
    modal_versus: "Versus Lobby",
    btn_host: "Host Game",
    btn_join: "Join Game",
    lbl_room_code: "Room Code: ",
    txt_waiting_opponent: "Waiting for opponent...",
    txt_you_win: "VICTORY!",
    txt_you_lose: "DEFEAT!",
    txt_opponent_hp: "Opponent HP:",
    txt_opponent_combo: "Opponent Combo:",
    btn_rematch: "Rematch",
    txt_rematch_wait: "Waiting for opponent...",
    txt_opponent_rematch: "Opponent wants a rematch!",
    modal_shop: "🛍️ Merchant",
    gold_label: "Gold: ",
    btn_close: "Close",
    modal_achievements: "🏆 Trophies",
    title_buff_index: "Buff Index",
    stat_best: "Best Score",
    stat_gold: "Total Gold",
    stat_bosses: "Bosses Defeated",
    stat_runs: "Total Stages",
    modal_settings: "Settings",
    lbl_volume: "Volume",
    lbl_music_volume: "Music",
    lbl_sfx_volume: "SFX",
    lbl_language: "Language",
    btn_save: "Save",
    modal_mode: "Select Mode",
    btn_normal: "Normal Mode (Mixed)",
    btn_add: "Addition Mode",
    btn_sub: "Subtraction Mode",
    btn_mul: "Multiplication Mode",
    btn_div: "Division Mode",
    hdr_stats: "Statistics",
    hdr_goals: "Goals",
    btn_leaderboard: "Leaderboard",
    modal_leaderboard: "📊 Top Heroes",
    col_rank: "Rank",
    col_name: "Hero",
    col_score: "Score",
    col_date: "Date",
    txt_empty_leaderboard: "No scores yet. Be the first!",

    // UI Play.html
    btn_flee: "Flee",
    lbl_run: "Stage",
    lbl_score: "Score: ",
    lbl_health: "Health",
    lbl_hp: "HP",
    lbl_stage_progress: "Stage Progress",
    lbl_combo: "Combo",
    lbl_def: "DEF: ",
    lbl_goldmod: "GOLD: ",
    lbl_scoremod: "SCORE: ",
    lbl_start: "Start",
    lbl_boss_encounter: "Boss Encounter",
    lbl_boss_hp: "Boss HP",
    lbl_loading: "Loading...",
    btn_return_hub: "Return to Camp",
    lbl_practice_mode: "Practice (0.2x Coins)",
    modal_run_over: "Run Over",
    msg_bravely: "You fought bravely.",
    rec_focus: "Recommendation: Focus on ",
    btn_practice: "Practice Now",
    btn_return: "Return to Hub",
    modal_reward: "BOSS DEFEATED!",
    msg_reward: "Choose your reward...",

    // Dynamic Play text
    txt_combo: "x COMBO!",
    txt_hit: "Super! ⭐",
    txt_miss: "Oops! 💡",
    txt_timeout: "Time's up! ⏰",
    txt_crit: "CRIT!",
    txt_fled: "Fled from battle.",
    txt_defeated: "Defeated...",
    txt_nine_lives: "NINE LIVES!",

    // Subjects
    sub_add: "Addition",
    sub_sub: "Subtraction",
    sub_mul: "Multiplication",
    sub_div: "Division",

    // Buttons Dynamic
    btn_equip: "Equip",
    btn_equipped: "Equipped",
    btn_buy: "Buy",
    txt_free: "Free",
    txt_not_enough: "Not enough gold!",
    txt_confirm_flee: "Are you sure you want to flee? You'll lose your current progress!",
    txt_yes: "Yes",
    txt_no: "No",
    btn_pause: "⏸️ Pause",
    txt_paused: "PAUSED",
    btn_resume: "Resume",

    // Buffs
    buff_heal_name: "Band-Aid", buff_heal_desc: "Get +50 Health.",
    buff_vit_name: "Super Health", buff_vit_desc: "Health bar gets bigger! (+25 Health)",
    buff_time_name: "Extra Time", buff_time_desc: "Get 2 more seconds for each question.",
    buff_greed_name: "Gold Magnet", buff_greed_desc: "Monsters drop more Gold!",
    buff_scholar_name: "Star Student", buff_scholar_desc: "Get more points for correct answers!",
    buff_def_name: "Shield", buff_def_desc: "Monsters do less damage to you.",
    buff_boss_name: "Boss Attack!", buff_boss_desc: "Only fight big Bosses! Big rewards!",
    buff_glass_name: "One Hit Hero", buff_glass_desc: "You have 1 Health, but get LOTS of points and gold!",
    buff_vamp_name: "Magic Steal", buff_vamp_desc: "Heals you for 10% of the damage you deal!",
    buff_gambler_name: "Lucky Coin", buff_gambler_desc: "Flip a coin! Maybe get 3x Gold, maybe get 0.",
    buff_nine_name: "Extra Life", buff_nine_desc: "If you lose all health, you come back to life once!",
    buff_warp_name: "Fast Mode", buff_warp_desc: "Only 5 seconds per question! But HUGE points!",
    buff_midas_name: "Golden Touch", buff_midas_desc: "Monsters drop 5x Gold! But they hit 2x harder!",
    buff_slowmo_name: "Turtle Speed", buff_slowmo_desc: "You have 30 seconds to answer! But fewer points.",
    buff_berserk_name: "Angry Mode", buff_berserk_desc: "Less time, but heal when you win and get more points!",

    // Achievements
    ach_g1_name: "Piggy Bank", ach_g1_desc: "Earn 100 Total Gold.",
    ach_g2_name: "Treasure Hunter", ach_g2_desc: "Earn 1,000 Total Gold.",
    ach_g3_name: "Mountain of Gold", ach_g3_desc: "Earn 10,000 Total Gold.",
    ach_s1_name: "Super Scorer", ach_s1_desc: "Reach a Best Score of 10,000.",
    ach_sk_name: "Dress Up", ach_sk_desc: "Unlock 10 different skins.",
    ach_b1_name: "Boss Defeater", ach_b1_desc: "Defeat 50 Bosses.",
    ach_p1_name: "Plus Champion", ach_p1_desc: "Answer 100 Addition questions correctly.",
    ach_p2_name: "Minus Champion", ach_p2_desc: "Answer 100 Subtraction questions correctly.",
    ach_p3_name: "Times Champion", ach_p3_desc: "Answer 100 Multiplication questions correctly.",
    ach_p4_name: "Divide Champion", ach_p4_desc: "Answer 100 Division questions correctly.",
    ach_m1_name: "Brave Hero", ach_m1_desc: "Defeat 10 Bosses using the Boss Attack! buff.",
    ach_m2_name: "Risky Winner", ach_m2_desc: "Defeat a Boss using the One Hit Hero buff.",
    ach_m3_name: "Flash Speed", ach_m3_desc: "Answer a question in under 1 second.",
    ach_m4_name: "Combo Master", ach_m4_desc: "Reach a 50x Combo streak.",
    ach_m5_name: "The Math Legend", ach_m5_desc: "Unlock the Math God skin.",
    ach_g4_name: "Rich Kid", ach_g4_desc: "Earn 50,000 Total Gold.",
    ach_g5_name: "Billionaire", ach_g5_desc: "Earn 100,000 Total Gold.",
    ach_s0_name: "Apprentice", ach_s0_desc: "Reach a Best Score of 1,000.",
    ach_s2_name: "Math Prodigy", ach_s2_desc: "Reach a Best Score of 50,000.",
    ach_s3_name: "Math Genius", ach_s3_desc: "Reach a Best Score of 100,000.",
    ach_sk2_name: "Fashionista", ach_sk2_desc: "Unlock 20 different skins.",
    ach_sk4_name: "Collector", ach_sk4_desc: "Unlock all skins.",
    ach_b0_name: "First Blood", ach_b0_desc: "Defeat your first Boss.",
    ach_b2_name: "God Slayer", ach_b2_desc: "Defeat 150 Bosses.",
    ach_p5_name: "Addition Master", ach_p5_desc: "Answer 500 Addition questions correctly.",
    ach_p6_name: "Subtraction Master", ach_p6_desc: "Answer 500 Subtraction questions correctly.",
    ach_p7_name: "Multiplication Master", ach_p7_desc: "Answer 500 Multiplication questions correctly.",
    ach_p8_name: "Division Master", ach_p8_desc: "Answer 500 Division questions correctly.",
    ach_m6_name: "Unstoppable", ach_m6_desc: "Reach a 100x Combo streak.",
    ach_r1_name: "Journey Begins", ach_r1_desc: "Play your first run.",
    ach_r2_name: "Veteran", ach_r2_desc: "Play 50 total runs.",
    ach_r3_name: "Addict", ach_r3_desc: "Play 100 total runs.",
    ach_m7_name: "Boss Rush Veteran", ach_m7_desc: "Defeat 50 Bosses using the Boss Attack! buff.",
    ach_m8_name: "Glass Cannon Veteran", ach_m8_desc: "Defeat 10 Bosses using the One Hit Hero buff.",
    ach_m9_name: "Quick Thinker", ach_m9_desc: "Answer a question in under 0.5 seconds.",

    // Tutorial
    tut_hub_welcome: "Welcome to the Base Camp!",
    tut_hub_welcome_desc: "This is your safe zone. Let's look around before you start your adventure.",
    tut_hub_cave: "Enter Cave",
    tut_hub_cave_desc: "Click here to start a run and fight monsters using math!",
    tut_hub_shop: "Merchant",
    tut_hub_shop_desc: "Use your hard-earned gold to buy cool new skins here.",
    tut_hub_ach: "Trophies",
    tut_hub_ach_desc: "Check your stats and unlock achievements for playing.",
    tut_hub_buff: "Buff Index",
    tut_hub_buff_desc: "Learn about the different magic buffs you can find in the cave.",
    tut_hub_settings: "Settings",
    tut_hub_settings_desc: "Change the language, volume, or replay this tutorial.",
    tut_btn_next: "Next",
    tut_btn_skip: "Skip",
    tut_btn_finish: "Finish",
    btn_replay_tutorial: "Replay Tutorial",
    
    tut_play_stats: "Your Progress",
    tut_play_stats_desc: "Here you can see your current Stage, Score, Health, and Combo multiplier.",
    tut_play_question: "Math Problem",
    tut_play_question_desc: "Solve this before the timer runs out to attack the monster!",
    tut_play_answers: "Answers",
    tut_play_answers_desc: "Click the correct answer. The faster you answer, the more damage you deal!",
    tut_play_pause: "Pause",
    tut_play_pause_desc: "Need a break? Pause here, or return to Base Camp with your gold."
  },
  id: {
    // UI Main Menu (index.html)
    menu_play: "Main",
    menu_guest: "Mode Tamu",
    menu_login: "Masuk",
    menu_back: "Kembali",
    menu_settings: "Pengaturan",
    menu_join_server: "GABUNG SERVER",
    menu_char_name: "Nama Karakter",
    menu_password: "Kata Sandi",
    menu_join: "Masuk",
    menu_cancel: "Batal",
    menu_signup: "Daftar",
    menu_login_title: "SELAMAT DATANG",
    menu_confirm_password: "Konfirmasi Sandi",
    txt_missing_fields: "Mohon masukkan nama dan kata sandi!",
    txt_profane: "Kata-kata kasar tidak diizinkan untuk nama atau kata sandi.",
    plc_hero: "Contoh: Pahlawan",

    // Skins
    skin_rainbow_name: "Pahlawan Biasa", skin_rainbow_desc: "Pahlawan standar.",
    skin_peasant_name: "Anak Desa", skin_peasant_desc: "Awal yang sederhana.",
    skin_adv_name: "Petualang", skin_adv_desc: "Siap untuk berpetualang.",
    skin_stone_name: "Baju Batu", skin_stone_desc: "Keras seperti batu.",
    skin_knight_name: "Ksatria Besi", skin_knight_desc: "Pertahanan besi yang kuat.",
    skin_mage_name: "Penyihir Pemula", skin_mage_desc: "Kekuatan ajaib.",
    skin_glow_name: "Penambang Neon", skin_glow_desc: "Gaya lari yang bersinar.",
    skin_ninja_name: "Ninja Bayangan", skin_ninja_desc: "Cepat dan sunyi.",
    skin_robot_name: "Baju Besi Robot", skin_robot_desc: "Baju besi tempur masa depan.",
    skin_gold_name: "Ksatria Emas", skin_gold_desc: "Berkilau dan mahal.",
    skin_diamond_name: "Baju Berlian", skin_diamond_desc: "Tidak bisa dihancurkan.",
    skin_fire_name: "Raja Api", skin_fire_desc: "Membakar dengan api di dalam.",
    skin_ice_name: "Penjaga Es", skin_ice_desc: "Dingin seperti es.",
    skin_phantom_name: "Pembunuh Hantu", skin_phantom_desc: "Hampir tidak terlihat.",
    skin_alien_name: "Makhluk Asing", skin_alien_desc: "Dari dunia lain.",
    skin_demon_name: "Raja Iblis", skin_demon_desc: "Penguasa yang menakutkan.",
    skin_angel_name: "Malaikat", skin_angel_desc: "Kehadiran suci.",
    skin_dragon_name: "Penjinak Naga", skin_dragon_desc: "Memerintah hewan buas.",
    skin_void_name: "Pejalan Kehampaan", skin_void_desc: "Menelan cahaya.",
    skin_celestial_name: "Makhluk Bintang", skin_celestial_desc: "Terbuat dari debu bintang.",
    skin_god_name: "Dewa Matematika", skin_god_desc: "Bentuk yang paling kuat.",

    // UI Game.html
    title_hub: "Pusat Permainan",
    welcome: "Selamat datang kembali, Pahlawan!",
    btn_start: "⚔️ Masuk Gua",
    btn_shop: "🛍️ Saudagar",
    btn_achievements: "🏆 Trofi",
    btn_buff_index: "📖 Indeks Buff",
    btn_leaderboard: "📊 Peringkat",
    btn_settings: "⚙️ Pengaturan",
    btn_versus: "Mode Duel",
    btn_logout: "Keluar",
    btn_main_menu: "Menu Utama",
    modal_versus: "Lobi Duel",
    btn_host: "Buat Ruangan",
    btn_join: "Masuk Ruangan",
    lbl_room_code: "Kode Ruangan: ",
    txt_waiting_opponent: "Menunggu lawan...",
    txt_you_win: "MENANG!",
    txt_you_lose: "KALAH!",
    txt_opponent_hp: "Darah Lawan:",
    txt_opponent_combo: "Kombo Lawan:",
    btn_rematch: "Tanding Ulang",
    txt_rematch_wait: "Menunggu lawan...",
    txt_opponent_rematch: "Lawan ingin tanding ulang!",
    modal_shop: "🛍️ Saudagar",
    gold_label: "Emas: ",
    btn_close: "Tutup",
    modal_achievements: "🏆 Trofi",
    title_buff_index: "Indeks Buff",
    stat_best: "Skor Terbaik",
    stat_gold: "Total Emas",
    stat_bosses: "Bos Dikalahkan",
    stat_runs: "Total Tahap",
    modal_settings: "Pengaturan",
    lbl_volume: "Volume",
    lbl_music_volume: "Musik",
    lbl_sfx_volume: "Efek Suara",
    lbl_language: "Bahasa",
    btn_save: "Simpan",
    modal_mode: "Pilih Mode",
    btn_normal: "Gua Dalam (Normal)",
    btn_add: "Mode Pertambahan",
    btn_sub: "Mode Pengurangan",
    btn_mul: "Mode Perkalian",
    btn_div: "Mode Pembagian",
    hdr_stats: "Statistik",
    hdr_goals: "Tujuan",
    btn_leaderboard: "Papan Peringkat",
    modal_leaderboard: "Skor Tertinggi",
    col_rank: "Peringkat",
    col_name: "Pahlawan",
    col_score: "Skor",
    col_date: "Tanggal",
    txt_empty_leaderboard: "Belum ada skor. Jadilah yang pertama!",

    // UI Play.html
    btn_flee: "Kabur",
    lbl_run: "Tahap",
    lbl_score: "Skor: ",
    lbl_health: "Darah",
    lbl_hp: "Darah",
    lbl_stage_progress: "Progress Level",
    lbl_combo: "Kombo",
    lbl_def: "PER: ",
    lbl_goldmod: "EMAS: ",
    lbl_scoremod: "SKOR: ",
    lbl_start: "Mulai",
    lbl_boss_encounter: "Pertemuan Bos",
    lbl_boss_hp: "Darah Bos",
    lbl_loading: "Memuat...",
    btn_return_hub: "Kembali ke Kemah",
    lbl_practice_mode: "Latihan (0.2x Koin)",
    modal_run_over: "Tahap Selesai",
    msg_bravely: "Kamu bertarung dengan berani.",
    rec_focus: "Rekomendasi: Fokus pada ",
    btn_practice: "Latihan Sekarang",
    btn_return: "Kembali ke Pusat",
    modal_reward: "BOS DIKALAHKAN!",
    msg_reward: "Pilih hadiahmu...",

    // Dynamic Play text
    txt_combo: "x KOMBO!",
    txt_hit: "Hebat! ⭐",
    txt_miss: "Ups! 💡",
    txt_timeout: "Waktu Habis! ⏰",
    txt_crit: "KRITIS!",
    txt_fled: "Kabur dari pertempuran.",
    txt_defeated: "Kalah...",
    txt_nine_lives: "NYAWA SEMBILAN!",

    // Subjects
    sub_add: "Pertambahan",
    sub_sub: "Pengurangan",
    sub_mul: "Perkalian",
    sub_div: "Pembagian",

    // Buttons Dynamic
    btn_equip: "Pakai",
    btn_equipped: "Dipakai",
    btn_buy: "Beli",
    txt_free: "Gratis",
    txt_not_enough: "Emas tidak cukup!",
    txt_confirm_flee: "Apakah kamu yakin ingin kabur? Kemajuanmu akan hilang!",
    txt_yes: "Ya",
    txt_no: "Tidak",
    btn_pause: "⏸️ Jeda",
    txt_paused: "JEDA",
    btn_resume: "Lanjut",

    // Buffs
    buff_heal_name: "Plester Luka", buff_heal_desc: "Tambah 50 Darah.",
    buff_vit_name: "Badan Kuat", buff_vit_desc: "Darah maksimal jadi lebih banyak! (+25 Darah)",
    buff_time_name: "Tambah Waktu", buff_time_desc: "Dapat ekstra 2 detik tiap pertanyaan.",
    buff_greed_name: "Magnet Emas", buff_greed_desc: "Monster menjatuhkan lebih banyak Emas!",
    buff_scholar_name: "Anak Pintar", buff_scholar_desc: "Dapat lebih banyak Skor saat menjawab benar!",
    buff_boss_name: "Pesta Bos", buff_boss_desc: "Hanya lawan Bos besar! Hadiah super besar!",
    buff_glass_name: "Pahlawan Satu Nyawa", buff_glass_desc: "Darahmu cuma 1, tapi dapat SANGAT BANYAK Emas & Skor!",
    buff_vamp_name: "Sihir Penyedot", buff_vamp_desc: "Memulihkan 10% dari damage yang kamu berikan!",
    buff_gambler_name: "Koin Keberuntungan", buff_gambler_desc: "Mungkin dapat 3x Emas, mungkin tidak dapat Emas.",
    buff_nine_name: "Nyawa Kucing", buff_nine_desc: "Kalau darahmu habis, kamu bisa hidup lagi satu kali!",
    buff_warp_name: "Mode Cepat", buff_warp_desc: "Cuma 5 detik tiap pertanyaan! Tapi Skor naik pesat!",
    buff_midas_name: "Sentuhan Emas", buff_midas_desc: "Monster kasih 5x Emas! Tapi serangan mereka 2x lebih sakit!",
    buff_slowmo_name: "Kecepatan Kura-kura", buff_slowmo_desc: "Kamu punya 30 detik untuk menjawab! Tapi Skor lebih sedikit.",
    buff_berserk_name: "Mode Marah", buff_berserk_desc: "Waktu jawab lebih cepat, tapi kamu sembuh tiap menang dan Skor besar!",

    // Achievements
    ach_g1_name: "Celengan", ach_g1_desc: "Dapatkan 100 Total Emas.",
    ach_g2_name: "Pemburu Harta", ach_g2_desc: "Dapatkan 1.000 Total Emas.",
    ach_g3_name: "Gunung Emas", ach_g3_desc: "Dapatkan 10.000 Total Emas.",
    ach_s1_name: "Pencetak Skor", ach_s1_desc: "Capai Skor Terbaik 10.000.",
    ach_sk_name: "Suka Dandan", ach_sk_desc: "Buka 10 kostum berbeda.",
    ach_b1_name: "Penakluk Bos", ach_b1_desc: "Kalahkan 50 Bos.",
    ach_p1_name: "Juara Tambah", ach_p1_desc: "Jawab 100 soal Pertambahan dengan benar.",
    ach_p2_name: "Juara Kurang", ach_p2_desc: "Jawab 100 soal Pengurangan dengan benar.",
    ach_p3_name: "Juara Kali", ach_p3_desc: "Jawab 100 soal Perkalian dengan benar.",
    ach_p4_name: "Juara Bagi", ach_p4_desc: "Jawab 100 soal Pembagian dengan benar.",
    ach_m1_name: "Pahlawan Berani", ach_m1_desc: "Kalahkan 10 Bos saat buff Pesta Bos aktif.",
    ach_m2_name: "Pemenang Nekat", ach_m2_desc: "Kalahkan Bos saat buff Pahlawan Satu Nyawa aktif.",
    ach_m3_name: "Secepat Kilat", ach_m3_desc: "Jawab pertanyaan dalam kurang dari 1 detik.",
    ach_m4_name: "Ahli Kombo", ach_m4_desc: "Capai rentetan Kombo 50x.",
    ach_m5_name: "Legenda Matematika", ach_m5_desc: "Buka kostum Dewa Matematika.",
    ach_g4_name: "Anak Sultan", ach_g4_desc: "Dapatkan 50.000 Total Emas.",
    ach_g5_name: "Miliarder", ach_g5_desc: "Dapatkan 100.000 Total Emas.",
    ach_s0_name: "Murid Pemula", ach_s0_desc: "Capai Skor Terbaik 1.000.",
    ach_s2_name: "Anak Ajaib", ach_s2_desc: "Capai Skor Terbaik 50.000.",
    ach_s3_name: "Jenius Matematika", ach_s3_desc: "Capai Skor Terbaik 100.000.",
    ach_sk2_name: "Model", ach_sk2_desc: "Buka 20 kostum berbeda.",
    ach_sk4_name: "Kolektor", ach_sk4_desc: "Buka semua kostum.",
    ach_b0_name: "Darah Pertama", ach_b0_desc: "Kalahkan Bos pertamamu.",
    ach_b2_name: "Pembunuh Dewa", ach_b2_desc: "Kalahkan 150 Bos.",
    ach_p5_name: "Master Tambah", ach_p5_desc: "Jawab 500 soal Pertambahan dengan benar.",
    ach_p6_name: "Master Kurang", ach_p6_desc: "Jawab 500 soal Pengurangan dengan benar.",
    ach_p7_name: "Master Kali", ach_p7_desc: "Jawab 500 soal Perkalian dengan benar.",
    ach_p8_name: "Master Bagi", ach_p8_desc: "Jawab 500 soal Pembagian dengan benar.",
    ach_m6_name: "Tak Terhentikan", ach_m6_desc: "Capai rentetan Kombo 100x.",
    ach_r1_name: "Awal Perjalanan", ach_r1_desc: "Mainkan tahap pertamamu.",
    ach_r2_name: "Veteran", ach_r2_desc: "Mainkan 50 total tahap.",
    ach_r3_name: "Pecandu", ach_r3_desc: "Mainkan 100 total tahap.",
    ach_m7_name: "Veteran Pesta Bos", ach_m7_desc: "Kalahkan 50 Bos saat buff Pesta Bos aktif.",
    ach_m8_name: "Veteran Satu Nyawa", ach_m8_desc: "Kalahkan 10 Bos saat buff Pahlawan Satu Nyawa aktif.",
    ach_m9_name: "Pemikir Cepat", ach_m9_desc: "Jawab pertanyaan dalam kurang dari 0.5 detik.",

    // Tutorial
    tut_hub_welcome: "Selamat datang di Kemah!",
    tut_hub_welcome_desc: "Ini adalah zona amanmu. Mari kita lihat sekeliling sebelum memulai petualangan.",
    tut_hub_cave: "Masuk Gua",
    tut_hub_cave_desc: "Klik di sini untuk memulai pertarungan melawan monster dengan matematika!",
    tut_hub_shop: "Saudagar",
    tut_hub_shop_desc: "Gunakan emasmu untuk membeli kostum baru yang keren di sini.",
    tut_hub_ach: "Trofi",
    tut_hub_ach_desc: "Cek statistikmu dan buka pencapaian selama bermain.",
    tut_hub_buff: "Indeks Buff",
    tut_hub_buff_desc: "Pelajari berbagai buff sihir yang bisa kamu temukan di dalam gua.",
    tut_hub_settings: "Pengaturan",
    tut_hub_settings_desc: "Ubah bahasa, volume, atau putar ulang tutorial ini.",
    tut_btn_next: "Lanjut",
    tut_btn_skip: "Lewati",
    tut_btn_finish: "Selesai",
    btn_replay_tutorial: "Ulang Tutorial",

    tut_play_stats: "Kemajuanmu",
    tut_play_stats_desc: "Di sini kamu bisa melihat Tahap, Skor, Darah, dan pengali Kombo kamu.",
    tut_play_question: "Soal Matematika",
    tut_play_question_desc: "Pecahkan ini sebelum waktu habis untuk menyerang monster!",
    tut_play_answers: "Jawaban",
    tut_play_answers_desc: "Klik jawaban yang benar. Semakin cepat menjawab, semakin besar seranganmu!",
    tut_play_pause: "Jeda",
    tut_play_pause_desc: "Butuh istirahat? Jeda di sini, atau kembali ke Kemah dengan aman."
  }
};

function getTranslation(key, lang = 'en') {
  return locales[lang]?.[key] || locales['en']?.[key] || key;
}

function applyTranslationsToDOM(lang = 'en') {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if(el.children.length === 0) {
      el.textContent = getTranslation(key, lang);
    } else {
      el.innerHTML = getTranslation(key, lang);
    }
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    el.setAttribute('placeholder', getTranslation(key, lang));
  });
}

// Global Toast Notification System
window.showToast = function(message, type = 'error') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }
  
  const toast = document.createElement('div');
  toast.className = `terra-toast ${type}`;
  toast.innerHTML = `<span style="font-size:1.2rem; filter:drop-shadow(1px 1px 0 rgba(0,0,0,0.8));">${type === 'error' ? '⚠️' : '✅'}</span> <span>${message}</span>`;
  
  container.appendChild(toast);
  
  if (typeof SFX !== 'undefined') {
    if (type === 'error') SFX.btnDanger();
    else SFX.btnClick();
  }
  
  setTimeout(() => {
    toast.classList.add('fade-out');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
};

// Global Custom Confirm Dialog
window.showConfirm = function(message) {
  return new Promise((resolve) => {
    if (typeof SFX !== 'undefined') SFX.btnDanger();
    
    const overlay = document.createElement('div');
    overlay.className = 'terra-modal-overlay show';
    overlay.style.zIndex = '10000';
    
    const card = document.createElement('div');
    card.className = 'terra-modal-card';
    card.style.textAlign = 'center';
    card.style.maxWidth = '400px';
    
    const text = document.createElement('p');
    text.style.fontFamily = "'Press Start 2P', monospace";
    text.style.fontSize = '0.8rem';
    text.style.lineHeight = '1.6';
    text.style.marginBottom = '24px';
    text.style.color = 'var(--text-main)';
    text.textContent = message;
    
    const btnContainer = document.createElement('div');
    btnContainer.style.display = 'flex';
    btnContainer.style.gap = '12px';
    
    const btnYes = document.createElement('button');
    btnYes.className = 'wood-btn danger';
    btnYes.style.flex = '1';
    const lang = (window.settings && window.settings.language) ? window.settings.language : 'en';
    btnYes.textContent = getTranslation('txt_yes', lang) || 'YES';
    
    const btnNo = document.createElement('button');
    btnNo.className = 'wood-btn';
    btnNo.style.flex = '1';
    btnNo.textContent = getTranslation('txt_no', lang) || 'NO';
    
    btnYes.onclick = () => {
      overlay.remove();
      resolve(true);
    };
    
    btnNo.onclick = () => {
      overlay.remove();
      if (typeof SFX !== 'undefined') SFX.btnClick();
      resolve(false);
    };
    
    btnContainer.appendChild(btnYes);
    btnContainer.appendChild(btnNo);
    
    card.appendChild(text);
    card.appendChild(btnContainer);
    overlay.appendChild(card);
    
    document.body.appendChild(overlay);
  });
};

window.getRankFromMMR = function(mmr) {
  if (!mmr || mmr < 20) return '🪨 Iron';
  if (mmr < 40) return '🥉 Bronze';
  if (mmr < 60) return '🥈 Silver';
  if (mmr < 80) return '🥇 Gold';
  if (mmr < 100) return '💎 Platinum';
  if (mmr < 150) return '💠 Diamond';
  return '👑 Master';
};
