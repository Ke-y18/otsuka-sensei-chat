class OtsukaSenseiChat {
    constructor() {
        this.chatInput = document.getElementById('chat-input');
        this.sendButton = document.getElementById('send-button');
        this.chatMessages = document.getElementById('chat-messages');
        this.avatar = document.getElementById('avatar');
        this.avatarStatus = document.getElementById('avatar-status');
        this.charCount = document.getElementById('char-count');
        
        // ゲーム関連の要素
        this.gameModal = document.getElementById('game-modal');
        this.gameModalTitle = document.getElementById('game-modal-title');
        this.gameContent = document.getElementById('game-content');
        this.gameModalClose = document.getElementById('game-modal-close');
        
        this.isSpeaking = false;
        this.speechSynthesis = window.speechSynthesis;
        
        // ゲーム状態
        this.currentGame = null;
        this.gameScore = 0;
        this.gameTotal = 0;
        
        this.initializeEventListeners();
        this.updateCharCount();
    }
    
    initializeEventListeners() {
        // 送信ボタンのクリックイベント
        this.sendButton.addEventListener('click', () => {
            this.sendMessage();
        });
        
        // Enterキーでの送信
        this.chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });
        
        // 文字数カウント
        this.chatInput.addEventListener('input', () => {
            this.updateCharCount();
        });
        
        // 入力フィールドのフォーカス
        this.chatInput.addEventListener('focus', () => {
            this.chatInput.style.borderColor = '#667eea';
        });
        
        this.chatInput.addEventListener('blur', () => {
            this.chatInput.style.borderColor = '#e0e0e0';
        });
        
        // ゲームボタンのイベントリスナー
        document.getElementById('math-game-btn').addEventListener('click', () => {
            this.startMathGame();
        });
        
        document.getElementById('typing-game-btn').addEventListener('click', () => {
            this.startTypingGame();
        });
        
        document.getElementById('memory-game-btn').addEventListener('click', () => {
            this.startMemoryGame();
        });
        
        document.getElementById('game2048-btn').addEventListener('click', () => {
            this.startGame2048();
        });
        
        // カジノゲームのイベントリスナー
        document.getElementById('slot-machine-btn').addEventListener('click', () => {
            this.startSlotMachine();
        });
        
        document.getElementById('blackjack-btn').addEventListener('click', () => {
            this.startBlackjack();
        });
        
        document.getElementById('roulette-btn').addEventListener('click', () => {
            this.startRoulette();
        });
        
        // モーダルを閉じるイベント
        this.gameModalClose.addEventListener('click', () => {
            this.closeGameModal();
        });
        
        // モーダル外クリックで閉じる
        this.gameModal.addEventListener('click', (e) => {
            if (e.target === this.gameModal) {
                this.closeGameModal();
            }
        });
        
        // キーボードイベント（2048ゲーム用）
        document.addEventListener('keydown', (e) => {
            if (this.currentGame === '2048') {
                this.handleGame2048Keydown(e);
            }
        });
    }
    
    updateCharCount() {
        const currentLength = this.chatInput.value.length;
        this.charCount.textContent = `${currentLength}/500`;
        
        // 文字数制限に近づいたら色を変更
        if (currentLength >= 450) {
            this.charCount.style.color = '#f44336';
        } else if (currentLength >= 400) {
            this.charCount.style.color = '#ff9800';
        } else {
            this.charCount.style.color = '#666';
        }
    }
    
    async sendMessage() {
        const message = this.chatInput.value.trim();
        if (!message || this.isSpeaking) return;
        
        // ユーザーメッセージを表示
        this.addMessage(message, 'user');
        this.chatInput.value = '';
        this.updateCharCount();
        
        // 送信ボタンを無効化
        this.sendButton.disabled = true;
        this.avatarStatus.textContent = '考え中...';
        
        try {
            // 大塚先生の返答を生成
            const response = await this.generateResponse(message);
            
            // 返答を表示
            this.addMessage(response, 'sensei');
            
            // 音声で返答
            await this.speakResponse(response);
            
        } catch (error) {
            console.error('エラーが発生しました:', error);
            this.addMessage('申し訳ございません。エラーが発生しました。', 'sensei');
        } finally {
            this.sendButton.disabled = false;
            this.avatarStatus.textContent = '待機中...';
        }
    }
    
    async generateResponse(userMessage) {
        // O先生の業務的な性格に基づいた返答パターン
        const responses = {
            greetings: [
                'ご連絡いただきありがとうございます。何かご質問やご相談がございましたら、お気軽にお聞かせください。',
                'いらっしゃいませ。O先生でございます。ご用件をお聞かせください。',
                'ご連絡いただきありがとうございます。お手伝いできることがございましたら、お申し付けください。'
            ],
            questions: [
                'ご質問いただきありがとうございます。詳細を確認いたしますので、少々お待ちください。',
                '承知いたしました。ご質問の件について、適切に対応いたします。',
                'ご質問ありがとうございます。正確な情報をお伝えするため、確認いたします。'
            ],
            problems: [
                'ご連絡いただきありがとうございます。お困りのことがございましたら、遠慮なくお申し付けください。',
                '大変でしたね。私にできることがございましたら、お手伝いいたします。',
                'ご連絡いただきありがとうございます。適切な対応をいたしますので、ご安心ください。'
            ],
            encouragement: [
                'ご連絡いただきありがとうございます。焦らずに注意して進めてください。',
                'ありがとうございます。一歩一歩、着実に進めていただければと思います。',
                'ご連絡いただきありがとうございます。お体に気をつけて、頑張ってください。'
            ],
            academic: [
                '100%というのは、実施状況で、得点ではありません。最高点が86点なので、100点になるまで実施してください。',
                '未完了の課題がございます。早めに完了させましょう。',
                '学習状況を確認いたします。必要に応じて、追加の課題をお渡しします。'
            ],
            attendance: [
                'ご連絡いただきありがとうございます。焦らずに注意して登校してください。',
                '遅延証明書が発行されていれば、受け取ってください。登校後、7階受付で交通機関遅延届を受け取り、遅延証明書を貼りつけて、授業担当の先生に提出してください。',
                'ご連絡いただきありがとうございます。お大事になさってください。'
            ],
            communication: [
                'クラスの連絡手段については、公的な集団の責任者として、適切なツールをご利用いただくようお願いいたします。',
                'ご連絡いただきありがとうございます。日程が決まりましたら、改めてお知らせいたします。',
                'メールのパスワードを紙でお渡ししたパスワードに戻してもらいました。ご確認ください。'
            ],
            events: [
                '学園祭の実行委員は、以下の方々に決まりました。すばらしい学園祭となるよう、楽しんでください。よろしくお願いいたします。',
                '昨年よりビジネス科がお仕事見学で訪問しているみなとみらいのアンパンマンミュージアムより、短期アルバイト求人のご案内をいただきました。ご検討ください。',
                '親睦を深めるなら、親睦会のようなイベントを企画してください。'
            ],
            games: [
                '学習の一環として、計算ゲーム、タイピングゲーム、記憶ゲーム、2048ゲームをご用意しております。お気軽にお試しください。',
                'ゲームで楽しく学習しましょう。計算力、タイピング力、記憶力、戦略的思考力を鍛えることができます。',
                'ご連絡いただきありがとうございます。ゲームを通じて、基礎学力の向上を図りましょう。2048ゲームは特に論理的思考力の向上に効果的です。'
            ],
            casino: [
                'カジノゲームもご用意しております。スロットマシン、ブラックジャック、ルーレットでお楽しみください。ただし、あくまでも娯楽としてお楽しみください。',
                'ご連絡いただきありがとうございます。カジノゲームは仮想通貨でお楽しみいただけます。責任ある娯楽としてお楽しみください。',
                'カジノゲームでリラックスタイムをお過ごしください。スロットマシンは運の要素が強く、ブラックジャックは戦略性が求められます。'
            ],
            default: [
                'ご連絡いただきありがとうございます。適切に対応いたします。',
                '承知いたしました。ご理解のほどよろしくお願いいたします。',
                'ご連絡いただきありがとうございます。お手数をおかけしますが、ご対応のほどよろしくお願いいたします。'
            ]
        };
        
        // メッセージの内容に基づいて返答を選択
        let category = 'default';
        
        if (userMessage.includes('こんにちは') || userMessage.includes('はじめまして') || userMessage.includes('おはよう') || userMessage.includes('よろしく')) {
            category = 'greetings';
        } else if (userMessage.includes('？') || userMessage.includes('ですか') || userMessage.includes('どう') || userMessage.includes('教えて')) {
            category = 'questions';
        } else if (userMessage.includes('困') || userMessage.includes('問題') || userMessage.includes('大変') || userMessage.includes('助けて')) {
            category = 'problems';
        } else if (userMessage.includes('頑張') || userMessage.includes('応援') || userMessage.includes('励ま') || userMessage.includes('進めて')) {
            category = 'encouragement';
        } else if (userMessage.includes('点') || userMessage.includes('成績') || userMessage.includes('課題') || userMessage.includes('学習') || userMessage.includes('100%')) {
            category = 'academic';
        } else if (userMessage.includes('遅刻') || userMessage.includes('欠席') || userMessage.includes('登校') || userMessage.includes('交通') || userMessage.includes('体調')) {
            category = 'attendance';
        } else if (userMessage.includes('Line') || userMessage.includes('連絡') || userMessage.includes('メール') || userMessage.includes('パスワード') || userMessage.includes('日程')) {
            category = 'communication';
        } else if (userMessage.includes('学園祭') || userMessage.includes('アルバイト') || userMessage.includes('親睦') || userMessage.includes('席替え') || userMessage.includes('イベント')) {
            category = 'events';
        } else if (userMessage.includes('ゲーム') || userMessage.includes('遊び') || userMessage.includes('計算') || userMessage.includes('タイピング') || userMessage.includes('記憶') || userMessage.includes('2048')) {
            category = 'games';
        } else if (userMessage.includes('カジノ') || userMessage.includes('スロット') || userMessage.includes('ブラックジャック') || userMessage.includes('ルーレット') || userMessage.includes('ギャンブル')) {
            category = 'casino';
        }
        
        const categoryResponses = responses[category];
        const randomIndex = Math.floor(Math.random() * categoryResponses.length);
        
        // 少し遅延を入れて自然な会話感を演出
        await this.delay(1000 + Math.random() * 2000);
        
        return categoryResponses[randomIndex];
    }
    
    addMessage(content, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`;
        
        const messageContent = document.createElement('div');
        messageContent.className = 'message-content';
        messageContent.textContent = content;
        
        const messageTime = document.createElement('div');
        messageTime.className = 'message-time';
        messageTime.textContent = this.getCurrentTime();
        
        messageDiv.appendChild(messageContent);
        messageDiv.appendChild(messageTime);
        
        this.chatMessages.appendChild(messageDiv);
        
        // 最新のメッセージまでスクロール
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    }
    
    async speakResponse(text) {
        if (!this.speechSynthesis) {
            console.warn('音声合成がサポートされていません');
            return;
        }
        
        // 既存の音声を停止
        this.speechSynthesis.cancel();
        
        return new Promise((resolve) => {
            const utterance = new SpeechSynthesisUtterance(text);
            
            // 日本語音声を設定
            utterance.lang = 'ja-JP';
            utterance.rate = 0.85; // よりゆっくり
            utterance.pitch = 0.4; // さらに低い声（中年男性らしく）
            utterance.volume = 1.0;
            
            // 音声開始時の処理
            utterance.onstart = () => {
                this.isSpeaking = true;
                this.avatar.classList.add('speaking');
                this.avatarStatus.textContent = '話し中...';
            };
            
            // 音声終了時の処理
            utterance.onend = () => {
                this.isSpeaking = false;
                this.avatar.classList.remove('speaking');
                this.avatarStatus.textContent = '待機中...';
                resolve();
            };
            
            // エラー処理
            utterance.onerror = (event) => {
                console.error('音声合成エラー:', event);
                this.isSpeaking = false;
                this.avatar.classList.remove('speaking');
                this.avatarStatus.textContent = '待機中...';
                resolve();
            };
            
            this.speechSynthesis.speak(utterance);
        });
    }
    
    getCurrentTime() {
        const now = new Date();
        const hours = now.getHours().toString().padStart(2, '0');
        const minutes = now.getMinutes().toString().padStart(2, '0');
        return `${hours}:${minutes}`;
    }
    
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    // ゲーム関連のメソッド
    openGameModal(title) {
        this.gameModalTitle.textContent = title;
        this.gameModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
    
    closeGameModal() {
        this.gameModal.classList.remove('active');
        document.body.style.overflow = 'auto';
        this.currentGame = null;
        this.gameScore = 0;
        this.gameTotal = 0;
    }
    
    // 計算ゲーム
    startMathGame() {
        this.currentGame = 'math';
        this.gameScore = 0;
        this.gameTotal = 0;
        this.openGameModal('計算ゲーム');
        this.generateMathQuestion();
    }
    
    generateMathQuestion() {
        const operations = ['+', '-', '*'];
        const operation = operations[Math.floor(Math.random() * operations.length)];
        let num1, num2, answer;
        
        switch(operation) {
            case '+':
                num1 = Math.floor(Math.random() * 50) + 1;
                num2 = Math.floor(Math.random() * 50) + 1;
                answer = num1 + num2;
                break;
            case '-':
                num1 = Math.floor(Math.random() * 50) + 50;
                num2 = Math.floor(Math.random() * num1) + 1;
                answer = num1 - num2;
                break;
            case '*':
                num1 = Math.floor(Math.random() * 12) + 1;
                num2 = Math.floor(Math.random() * 12) + 1;
                answer = num1 * num2;
                break;
        }
        
        this.gameTotal++;
        const question = `${num1} ${operation} ${num2} = ?`;
        
        this.gameContent.innerHTML = `
            <div class="game-question">${question}</div>
            <input type="number" class="game-input" id="math-answer" placeholder="答えを入力してください">
            <div>
                <button class="game-submit" onclick="otsukaSenseiChat.checkMathAnswer(${answer})">回答</button>
                <button class="game-submit" onclick="otsukaSenseiChat.closeGameModal()">終了</button>
            </div>
            <div class="game-score">正解数: ${this.gameScore}/${this.gameTotal}</div>
        `;
        
        document.getElementById('math-answer').focus();
        document.getElementById('math-answer').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.checkMathAnswer(answer);
            }
        });
    }
    
    checkMathAnswer(correctAnswer) {
        const userAnswer = parseInt(document.getElementById('math-answer').value);
        const resultDiv = document.createElement('div');
        
        if (userAnswer === correctAnswer) {
            this.gameScore++;
            resultDiv.className = 'game-result correct';
            resultDiv.textContent = '正解です！素晴らしいです。';
        } else {
            resultDiv.className = 'game-result incorrect';
            resultDiv.textContent = `不正解です。正解は ${correctAnswer} でした。`;
        }
        
        this.gameContent.appendChild(resultDiv);
        
        setTimeout(() => {
            this.generateMathQuestion();
        }, 2000);
    }
    
    // タイピングゲーム
    startTypingGame() {
        this.currentGame = 'typing';
        this.gameScore = 0;
        this.gameTotal = 0;
        this.openGameModal('タイピングゲーム');
        this.generateTypingQuestion();
    }
    
    generateTypingQuestion() {
        const sentences = [
            'ご連絡いただきありがとうございます。',
            '焦らずに注意して進めてください。',
            '学習状況を確認いたします。',
            '適切に対応いたします。',
            'お体に気をつけてください。',
            'ご理解のほどよろしくお願いいたします。',
            '早めに完了させましょう。',
            'お手伝いできることがございましたら。'
        ];
        
        const sentence = sentences[Math.floor(Math.random() * sentences.length)];
        this.gameTotal++;
        
        this.gameContent.innerHTML = `
            <div class="game-question">以下の文章を正確にタイピングしてください：</div>
            <div style="background: #f8f9fa; padding: 15px; border-radius: 10px; margin-bottom: 20px; font-size: 1.1rem;">
                ${sentence}
            </div>
            <input type="text" class="game-input" id="typing-answer" placeholder="文章を入力してください">
            <div>
                <button class="game-submit" onclick="otsukaSenseiChat.checkTypingAnswer('${sentence}')">回答</button>
                <button class="game-submit" onclick="otsukaSenseiChat.closeGameModal()">終了</button>
            </div>
            <div class="game-score">正解数: ${this.gameScore}/${this.gameTotal}</div>
        `;
        
        document.getElementById('typing-answer').focus();
        document.getElementById('typing-answer').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.checkTypingAnswer(sentence);
            }
        });
    }
    
    checkTypingAnswer(correctSentence) {
        const userAnswer = document.getElementById('typing-answer').value.trim();
        const resultDiv = document.createElement('div');
        
        if (userAnswer === correctSentence) {
            this.gameScore++;
            resultDiv.className = 'game-result correct';
            resultDiv.textContent = '正解です！正確にタイピングできました。';
        } else {
            resultDiv.className = 'game-result incorrect';
            resultDiv.textContent = `不正解です。正解は「${correctSentence}」でした。`;
        }
        
        this.gameContent.appendChild(resultDiv);
        
        setTimeout(() => {
            this.generateTypingQuestion();
        }, 2000);
    }
    
    // 記憶ゲーム
    startMemoryGame() {
        this.currentGame = 'memory';
        this.gameScore = 0;
        this.gameTotal = 0;
        this.openGameModal('記憶ゲーム');
        this.generateMemorySequence();
    }
    
    generateMemorySequence() {
        const sequence = [];
        const length = Math.floor(Math.random() * 3) + 3; // 3-5個の数字
        
        for (let i = 0; i < length; i++) {
            sequence.push(Math.floor(Math.random() * 9) + 1);
        }
        
        this.gameTotal++;
        this.currentSequence = sequence;
        
        this.gameContent.innerHTML = `
            <div class="game-question">以下の数字を覚えてください：</div>
            <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin-bottom: 20px; font-size: 2rem; font-weight: bold;">
                ${sequence.join(' - ')}
            </div>
            <div style="margin-bottom: 20px;">
                <button class="game-submit" onclick="otsukaSenseiChat.showMemoryInput()">数字を隠す</button>
            </div>
            <div class="game-score">正解数: ${this.gameScore}/${this.gameTotal}</div>
        `;
    }
    
    showMemoryInput() {
        this.gameContent.innerHTML = `
            <div class="game-question">覚えた数字を順番に入力してください：</div>
            <input type="text" class="game-input" id="memory-answer" placeholder="例: 1 2 3 4 5">
            <div>
                <button class="game-submit" onclick="otsukaSenseiChat.checkMemoryAnswer()">回答</button>
                <button class="game-submit" onclick="otsukaSenseiChat.closeGameModal()">終了</button>
            </div>
            <div class="game-score">正解数: ${this.gameScore}/${this.gameTotal}</div>
        `;
        
        document.getElementById('memory-answer').focus();
        document.getElementById('memory-answer').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.checkMemoryAnswer();
            }
        });
    }
    
    checkMemoryAnswer() {
        const userAnswer = document.getElementById('memory-answer').value.trim();
        const userSequence = userAnswer.split(/[\s\-]+/).map(num => parseInt(num)).filter(num => !isNaN(num));
        const resultDiv = document.createElement('div');
        
        const isCorrect = userSequence.length === this.currentSequence.length && 
                         userSequence.every((num, index) => num === this.currentSequence[index]);
        
        if (isCorrect) {
            this.gameScore++;
            resultDiv.className = 'game-result correct';
            resultDiv.textContent = '正解です！素晴らしい記憶力です。';
        } else {
            resultDiv.className = 'game-result incorrect';
            resultDiv.textContent = `不正解です。正解は「${this.currentSequence.join(' - ')}」でした。`;
        }
        
        this.gameContent.appendChild(resultDiv);
        
        setTimeout(() => {
            this.generateMemorySequence();
        }, 2000);
    }
    
    // 2048ゲーム
    startGame2048() {
        this.currentGame = '2048';
        this.game2048Score = 0;
        this.game2048Grid = Array(4).fill().map(() => Array(4).fill(0));
        this.game2048GameOver = false;
        this.game2048Won = false;
        this.newTilePosition = null;
        this.mergedPositions = [];
        
        this.openGameModal('2048ゲーム');
        this.initializeGame2048();
    }
    
    initializeGame2048() {
        // 初期状態で2つのタイルを配置
        this.addRandomTile();
        this.addRandomTile();
        
        this.renderGame2048();
    }
    
    addRandomTile() {
        const emptyCells = [];
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                if (this.game2048Grid[i][j] === 0) {
                    emptyCells.push({row: i, col: j});
                }
            }
        }
        
        if (emptyCells.length > 0) {
            const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
            this.game2048Grid[randomCell.row][randomCell.col] = 2;
            this.newTilePosition = {row: randomCell.row, col: randomCell.col};
        }
    }
    
    renderGame2048() {
        this.gameContent.innerHTML = `
            <div class="game2048-container">
                <div class="game2048-instructions">
                    矢印キーでタイルを移動させ、同じ数字のタイルを合体させて2048を作りましょう！
                </div>
                <div class="game2048-info">
                    <div class="game2048-score">
                        <div class="game2048-score-label">スコア</div>
                        <div class="game2048-score-value">${this.game2048Score}</div>
                    </div>
                </div>
                <div class="game2048-grid" id="game2048-grid">
                    ${this.generateGame2048HTML()}
                </div>
                <div class="game2048-controls">
                    <button class="game-submit" onclick="otsukaSenseiChat.restartGame2048()">リスタート</button>
                    <button class="game-submit" onclick="otsukaSenseiChat.closeGameModal()">終了</button>
                </div>
            </div>
        `;
        
        if (this.game2048Won) {
            const winnerDiv = document.createElement('div');
            winnerDiv.className = 'game2048-winner';
            winnerDiv.textContent = 'おめでとうございます！2048を作りました！';
            this.gameContent.querySelector('.game2048-container').appendChild(winnerDiv);
        } else if (this.game2048GameOver) {
            const gameOverDiv = document.createElement('div');
            gameOverDiv.className = 'game2048-gameover';
            gameOverDiv.textContent = 'ゲームオーバーです。もう一度挑戦してください。';
            this.gameContent.querySelector('.game2048-container').appendChild(gameOverDiv);
        }
    }
    
    generateGame2048HTML() {
        let html = '';
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                const value = this.game2048Grid[i][j];
                let className = 'game2048-cell';
                
                // 新しいタイルのアニメーション
                if (this.newTilePosition && this.newTilePosition.row === i && this.newTilePosition.col === j) {
                    className += ' new-tile';
                }
                
                // マージされたタイルのアニメーション
                if (this.mergedPositions && this.mergedPositions.some(pos => pos.row === i && pos.col === j)) {
                    className += ' merged';
                }
                
                html += `<div class="${className}" data-value="${value}">${value || ''}</div>`;
            }
        }
        return html;
    }
    
    handleGame2048Keydown(e) {
        if (this.game2048GameOver) return;
        
        let moved = false;
        
        switch(e.key) {
            case 'ArrowUp':
                e.preventDefault();
                moved = this.moveGame2048('up');
                break;
            case 'ArrowDown':
                e.preventDefault();
                moved = this.moveGame2048('down');
                break;
            case 'ArrowLeft':
                e.preventDefault();
                moved = this.moveGame2048('left');
                break;
            case 'ArrowRight':
                e.preventDefault();
                moved = this.moveGame2048('right');
                break;
        }
        
        if (moved) {
            this.addRandomTile();
            this.renderGame2048();
            this.checkGame2048Status();
            
            // アニメーション用の状態をリセット
            setTimeout(() => {
                this.newTilePosition = null;
                this.mergedPositions = [];
            }, 300);
        }
    }
    
    moveGame2048(direction) {
        let moved = false;
        const oldGrid = JSON.parse(JSON.stringify(this.game2048Grid));
        
        switch(direction) {
            case 'up':
                moved = this.moveGame2048Up();
                break;
            case 'down':
                moved = this.moveGame2048Down();
                break;
            case 'left':
                moved = this.moveGame2048Left();
                break;
            case 'right':
                moved = this.moveGame2048Right();
                break;
        }
        
        return moved;
    }
    
    moveGame2048Up() {
        let moved = false;
        this.mergedPositions = [];
        
        for (let col = 0; col < 4; col++) {
            const column = [];
            for (let row = 0; row < 4; row++) {
                if (this.game2048Grid[row][col] !== 0) {
                    column.push(this.game2048Grid[row][col]);
                }
            }
            
            // マージ
            for (let i = 0; i < column.length - 1; i++) {
                if (column[i] === column[i + 1]) {
                    column[i] *= 2;
                    this.game2048Score += column[i];
                    this.mergedPositions.push({row: i, col: col});
                    column.splice(i + 1, 1);
                }
            }
            
            // 0で埋める
            while (column.length < 4) {
                column.push(0);
            }
            
            // グリッドに戻す
            for (let row = 0; row < 4; row++) {
                if (this.game2048Grid[row][col] !== column[row]) {
                    moved = true;
                }
                this.game2048Grid[row][col] = column[row];
            }
        }
        return moved;
    }
    
    moveGame2048Down() {
        let moved = false;
        this.mergedPositions = [];
        
        for (let col = 0; col < 4; col++) {
            const column = [];
            for (let row = 3; row >= 0; row--) {
                if (this.game2048Grid[row][col] !== 0) {
                    column.push(this.game2048Grid[row][col]);
                }
            }
            
            // マージ
            for (let i = 0; i < column.length - 1; i++) {
                if (column[i] === column[i + 1]) {
                    column[i] *= 2;
                    this.game2048Score += column[i];
                    this.mergedPositions.push({row: 3 - i, col: col});
                    column.splice(i + 1, 1);
                }
            }
            
            // 0で埋める
            while (column.length < 4) {
                column.push(0);
            }
            
            // グリッドに戻す
            for (let row = 3; row >= 0; row--) {
                const index = 3 - row;
                if (this.game2048Grid[row][col] !== column[index]) {
                    moved = true;
                }
                this.game2048Grid[row][col] = column[index];
            }
        }
        return moved;
    }
    
    moveGame2048Left() {
        let moved = false;
        this.mergedPositions = [];
        
        for (let row = 0; row < 4; row++) {
            const line = this.game2048Grid[row].filter(cell => cell !== 0);
            
            // マージ
            for (let i = 0; i < line.length - 1; i++) {
                if (line[i] === line[i + 1]) {
                    line[i] *= 2;
                    this.game2048Score += line[i];
                    this.mergedPositions.push({row: row, col: i});
                    line.splice(i + 1, 1);
                }
            }
            
            // 0で埋める
            while (line.length < 4) {
                line.push(0);
            }
            
            // グリッドに戻す
            for (let col = 0; col < 4; col++) {
                if (this.game2048Grid[row][col] !== line[col]) {
                    moved = true;
                }
                this.game2048Grid[row][col] = line[col];
            }
        }
        return moved;
    }
    
    moveGame2048Right() {
        let moved = false;
        this.mergedPositions = [];
        
        for (let row = 0; row < 4; row++) {
            const line = this.game2048Grid[row].filter(cell => cell !== 0);
            
            // マージ
            for (let i = line.length - 1; i > 0; i--) {
                if (line[i] === line[i - 1]) {
                    line[i] *= 2;
                    this.game2048Score += line[i];
                    this.mergedPositions.push({row: row, col: 4 - line.length + i});
                    line.splice(i - 1, 1);
                }
            }
            
            // 0で埋める
            while (line.length < 4) {
                line.unshift(0);
            }
            
            // グリッドに戻す
            for (let col = 0; col < 4; col++) {
                if (this.game2048Grid[row][col] !== line[col]) {
                    moved = true;
                }
                this.game2048Grid[row][col] = line[col];
            }
        }
        return moved;
    }
    
    checkGame2048Status() {
        // 2048タイルがあるかチェック
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                if (this.game2048Grid[i][j] === 2048) {
                    this.game2048Won = true;
                    return;
                }
            }
        }
        
        // ゲームオーバーチェック
        if (this.isGame2048Over()) {
            this.game2048GameOver = true;
        }
    }
    
    isGame2048Over() {
        // 空のセルがあるかチェック
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                if (this.game2048Grid[i][j] === 0) {
                    return false;
                }
            }
        }
        
        // 隣接するセルでマージ可能なものがあるかチェック
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                const current = this.game2048Grid[i][j];
                
                // 右隣
                if (j < 3 && this.game2048Grid[i][j + 1] === current) {
                    return false;
                }
                
                // 下隣
                if (i < 3 && this.game2048Grid[i + 1][j] === current) {
                    return false;
                }
            }
        }
        
        return true;
    }
    
    restartGame2048() {
        this.game2048Score = 0;
        this.game2048Grid = Array(4).fill().map(() => Array(4).fill(0));
        this.game2048GameOver = false;
        this.game2048Won = false;
        this.newTilePosition = null;
        this.mergedPositions = [];
        this.initializeGame2048();
    }
    
    // カジノゲーム共通機能
    initializeCasino() {
        if (!this.casinoBalance) {
            this.casinoBalance = 1000; // 初期資金1000コイン
        }
    }
    
    updateCasinoBalance() {
        const balanceElement = document.querySelector('.casino-balance-amount');
        if (balanceElement) {
            balanceElement.textContent = this.casinoBalance;
        }
    }
    
    // スロットマシン
    startSlotMachine() {
        this.initializeCasino();
        this.currentGame = 'slot';
        this.openGameModal('スロットマシン');
        this.renderSlotMachine();
    }
    
    renderSlotMachine() {
        this.gameContent.innerHTML = `
            <div class="casino-container">
                <div class="casino-balance">
                    <div class="casino-balance-label">残高</div>
                    <div class="casino-balance-amount">${this.casinoBalance}</div>
                </div>
                <div class="slot-machine">
                    <div class="slot-header">🎰 O先生のスロットマシン 🎰</div>
                    <div class="slot-reels-container">
                        <div class="slot-reels">
                            <div class="slot-reel" id="reel1">🍎</div>
                            <div class="slot-reel" id="reel2">🍊</div>
                            <div class="slot-reel" id="reel3">🍇</div>
                        </div>
                    </div>
                    <div class="slot-bet">
                        <label>ベット額:</label>
                        <input type="number" id="slot-bet-amount" value="10" min="1" max="${this.casinoBalance}">
                    </div>
                    <div class="slot-controls">
                        <button class="slot-spin-btn" onclick="otsukaSenseiChat.spinSlot()">🎰 スピン 🎰</button>
                        <button class="blackjack-btn" onclick="otsukaSenseiChat.closeGameModal()">終了</button>
                    </div>
                </div>
            </div>
        `;
    }
    
    spinSlot() {
        const betAmount = parseInt(document.getElementById('slot-bet-amount').value);
        if (betAmount > this.casinoBalance) {
            alert('残高が不足しています');
            return;
        }
        
        this.casinoBalance -= betAmount;
        this.updateCasinoBalance();
        
        const reels = ['🍎', '🍊', '🍇', '🍒', '🍋', '🍉', '🎰', '💎'];
        const results = [];
        
        // スピンボタンを無効化
        const spinBtn = document.querySelector('.slot-spin-btn');
        spinBtn.disabled = true;
        spinBtn.textContent = '🎰 スピン中... 🎰';
        
        // スピンアニメーション
        const reelElements = document.querySelectorAll('.slot-reel');
        reelElements.forEach((reel, index) => {
            reel.classList.add('spinning');
            setTimeout(() => {
                const result = reels[Math.floor(Math.random() * reels.length)];
                results[index] = result;
                reel.textContent = result;
                reel.classList.remove('spinning');
                
                // 勝利時のエフェクト
                if (index === 2) {
                    this.checkSlotResult(results, betAmount);
                    // ボタンを再有効化
                    spinBtn.disabled = false;
                    spinBtn.textContent = '🎰 スピン 🎰';
                }
            }, 1000 + index * 500);
        });
    }
    
    checkSlotResult(results, betAmount) {
        let winAmount = 0;
        let message = '';
        
        if (results[0] === results[1] && results[1] === results[2]) {
            if (results[0] === '🎰') {
                winAmount = betAmount * 10; // ジャックポット
                message = '🎉 ジャックポット！🎉';
                this.addWinnerEffect();
            } else if (results[0] === '💎') {
                winAmount = betAmount * 5; // ダイヤモンド
                message = '💎 ダイヤモンド！💎';
                this.addWinnerEffect();
            } else {
                winAmount = betAmount * 3; // 通常の3つ揃い
                message = '🎊 3つ揃い！🎊';
                this.addWinnerEffect();
            }
        } else if (results[0] === results[1] || results[1] === results[2] || results[0] === results[2]) {
            winAmount = betAmount * 1.5; // 2つ揃い
            message = '🎯 2つ揃い！🎯';
        } else {
            message = '残念...';
        }
        
        this.casinoBalance += winAmount;
        this.updateCasinoBalance();
        
        const resultDiv = document.createElement('div');
        resultDiv.className = `casino-result ${winAmount > 0 ? 'win' : 'lose'}`;
        resultDiv.textContent = `${message} ${winAmount > 0 ? '+' + winAmount : ''}`;
        this.gameContent.querySelector('.casino-container').appendChild(resultDiv);
        
        // 勝利時のリールエフェクト
        if (winAmount > 0) {
            const reelElements = document.querySelectorAll('.slot-reel');
            reelElements.forEach(reel => {
                reel.classList.add('winner');
                setTimeout(() => reel.classList.remove('winner'), 1500);
            });
        }
        
        setTimeout(() => {
            resultDiv.remove();
        }, 3000);
    }
    
    addWinnerEffect() {
        // 勝利時の特別エフェクト
        const container = this.gameContent.querySelector('.casino-container');
        const effect = document.createElement('div');
        effect.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: linear-gradient(45deg, transparent, rgba(255,215,0,0.3), transparent);
            pointer-events: none;
            animation: winnerFlash 0.5s ease-in-out;
            z-index: 1000;
        `;
        container.style.position = 'relative';
        container.appendChild(effect);
        
        setTimeout(() => effect.remove(), 500);
    }
    
    // ブラックジャック
    startBlackjack() {
        this.initializeCasino();
        this.currentGame = 'blackjack';
        this.blackjackDeck = this.createDeck();
        this.blackjackPlayerHand = [];
        this.blackjackDealerHand = [];
        this.blackjackBet = 0;
        this.openGameModal('ブラックジャック');
        this.renderBlackjack();
    }
    
    createDeck() {
        const suits = ['♠', '♥', '♦', '♣'];
        const values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
        const deck = [];
        
        for (let suit of suits) {
            for (let value of values) {
                deck.push({suit, value});
            }
        }
        
        // シャッフル
        for (let i = deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [deck[i], deck[j]] = [deck[j], deck[i]];
        }
        
        return deck;
    }
    
    renderBlackjack() {
        this.gameContent.innerHTML = `
            <div class="casino-container">
                <div class="casino-balance">
                    <div class="casino-balance-label">残高</div>
                    <div class="casino-balance-amount">${this.casinoBalance}</div>
                </div>
                <div class="blackjack-table">
                    <div class="blackjack-header">🃏 O先生のブラックジャック 🃏</div>
                    <div class="blackjack-hands">
                        <div class="blackjack-hand">
                            <div class="blackjack-hand-title">O先生（ディーラー）</div>
                            <div class="blackjack-cards" id="dealer-cards"></div>
                            <div class="blackjack-score" id="dealer-score"></div>
                        </div>
                        <div class="blackjack-hand">
                            <div class="blackjack-hand-title">プレイヤー</div>
                            <div class="blackjack-cards" id="player-cards"></div>
                            <div class="blackjack-score" id="player-score"></div>
                        </div>
                    </div>
                    <div class="blackjack-controls" id="blackjack-controls">
                        <div class="blackjack-bet-input">
                            <label>ベット額:</label>
                            <input type="number" id="blackjack-bet" placeholder="ベット額" min="1" max="${this.casinoBalance}">
                        </div>
                        <button class="blackjack-btn" onclick="otsukaSenseiChat.startBlackjackRound()">🃏 ゲーム開始 🃏</button>
                        <button class="blackjack-btn" onclick="otsukaSenseiChat.closeGameModal()">終了</button>
                    </div>
                </div>
            </div>
        `;
    }
    
    startBlackjackRound() {
        const betAmount = parseInt(document.getElementById('blackjack-bet').value);
        if (!betAmount || betAmount > this.casinoBalance) {
            alert('有効なベット額を入力してください');
            return;
        }
        
        this.blackjackBet = betAmount;
        this.casinoBalance -= betAmount;
        this.updateCasinoBalance();
        
        // 初期カードを配る
        this.blackjackPlayerHand = [this.blackjackDeck.pop(), this.blackjackDeck.pop()];
        this.blackjackDealerHand = [this.blackjackDeck.pop(), this.blackjackDeck.pop()];
        
        this.updateBlackjackDisplay();
        
        // コントロールを更新
        document.getElementById('blackjack-controls').innerHTML = `
            <button class="blackjack-btn" onclick="otsukaSenseiChat.blackjackHit()">🃏 ヒット 🃏</button>
            <button class="blackjack-btn" onclick="otsukaSenseiChat.blackjackStand()">🃏 スタンド 🃏</button>
            <button class="blackjack-btn" onclick="otsukaSenseiChat.closeGameModal()">終了</button>
        `;
    }
    
    updateBlackjackDisplay() {
        // ディーラーのカード表示
        const dealerCards = document.getElementById('dealer-cards');
        dealerCards.innerHTML = '';
        this.blackjackDealerHand.forEach((card, index) => {
            const cardElement = document.createElement('div');
            cardElement.className = `blackjack-card ${index === 1 ? 'hidden' : ''}`;
            cardElement.textContent = index === 1 ? '?' : `${card.value}${card.suit}`;
            dealerCards.appendChild(cardElement);
        });
        
        // プレイヤーのカード表示
        const playerCards = document.getElementById('player-cards');
        playerCards.innerHTML = '';
        this.blackjackPlayerHand.forEach((card, index) => {
            const cardElement = document.createElement('div');
            cardElement.className = `blackjack-card ${index >= this.blackjackPlayerHand.length - 1 ? 'new-card' : ''}`;
            cardElement.textContent = `${card.value}${card.suit}`;
            playerCards.appendChild(cardElement);
        });
        
        // スコア表示
        document.getElementById('player-score').textContent = `スコア: ${this.calculateBlackjackScore(this.blackjackPlayerHand)}`;
        document.getElementById('dealer-score').textContent = `スコア: ${this.calculateBlackjackScore(this.blackjackDealerHand)}`;
    }
    
    calculateBlackjackScore(hand) {
        let score = 0;
        let aces = 0;
        
        for (let card of hand) {
            if (card.value === 'A') {
                aces++;
            } else if (['K', 'Q', 'J'].includes(card.value)) {
                score += 10;
            } else {
                score += parseInt(card.value);
            }
        }
        
        // エースの処理
        for (let i = 0; i < aces; i++) {
            if (score + 11 <= 21) {
                score += 11;
            } else {
                score += 1;
            }
        }
        
        return score;
    }
    
    blackjackHit() {
        this.blackjackPlayerHand.push(this.blackjackDeck.pop());
        this.updateBlackjackDisplay();
        
        const playerScore = this.calculateBlackjackScore(this.blackjackPlayerHand);
        if (playerScore > 21) {
            this.endBlackjackRound('bust');
        }
    }
    
    blackjackStand() {
        // ディーラーのカードを全て表示
        const dealerCards = document.getElementById('dealer-cards');
        dealerCards.innerHTML = '';
        this.blackjackDealerHand.forEach(card => {
            const cardElement = document.createElement('div');
            cardElement.className = 'blackjack-card';
            cardElement.textContent = `${card.value}${card.suit}`;
            dealerCards.appendChild(cardElement);
        });
        
        // ディーラーのプレイ
        while (this.calculateBlackjackScore(this.blackjackDealerHand) < 17) {
            this.blackjackDealerHand.push(this.blackjackDeck.pop());
        }
        
        this.updateBlackjackDisplay();
        
        const dealerScore = this.calculateBlackjackScore(this.blackjackDealerHand);
        const playerScore = this.calculateBlackjackScore(this.blackjackPlayerHand);
        
        if (dealerScore > 21) {
            this.endBlackjackRound('dealer_bust');
        } else if (dealerScore > playerScore) {
            this.endBlackjackRound('dealer_win');
        } else if (dealerScore < playerScore) {
            this.endBlackjackRound('player_win');
        } else {
            this.endBlackjackRound('draw');
        }
    }
    
    endBlackjackRound(result) {
        let message = '';
        let winAmount = 0;
        
        switch(result) {
            case 'bust':
                message = 'バスト！O先生の勝ち';
                break;
            case 'dealer_bust':
                message = 'O先生バスト！プレイヤーの勝ち';
                winAmount = this.blackjackBet * 2;
                break;
            case 'dealer_win':
                message = 'O先生の勝ち';
                break;
            case 'player_win':
                message = 'プレイヤーの勝ち';
                winAmount = this.blackjackBet * 2;
                break;
            case 'draw':
                message = '引き分け';
                winAmount = this.blackjackBet;
                break;
        }
        
        this.casinoBalance += winAmount;
        this.updateCasinoBalance();
        
        const resultDiv = document.createElement('div');
        resultDiv.className = `casino-result ${winAmount > this.blackjackBet ? 'win' : winAmount === this.blackjackBet ? 'draw' : 'lose'}`;
        resultDiv.textContent = `${message} ${winAmount > 0 ? '+' + winAmount : ''}`;
        this.gameContent.querySelector('.casino-container').appendChild(resultDiv);
        
        // コントロールをリセット
        setTimeout(() => {
            document.getElementById('blackjack-controls').innerHTML = `
                <div class="blackjack-bet-input">
                    <label>ベット額:</label>
                    <input type="number" id="blackjack-bet" placeholder="ベット額" min="1" max="${this.casinoBalance}">
                </div>
                <button class="blackjack-btn" onclick="otsukaSenseiChat.startBlackjackRound()">🃏 ゲーム開始 🃏</button>
                <button class="blackjack-btn" onclick="otsukaSenseiChat.closeGameModal()">終了</button>
            `;
            resultDiv.remove();
        }, 3000);
    }
    
    // ルーレット
    startRoulette() {
        this.initializeCasino();
        this.currentGame = 'roulette';
        this.rouletteSelectedBet = null;
        this.openGameModal('ルーレット');
        this.renderRoulette();
    }
    
    renderRoulette() {
        this.gameContent.innerHTML = `
            <div class="casino-container">
                <div class="casino-balance">
                    <div class="casino-balance-label">残高</div>
                    <div class="casino-balance-amount">${this.casinoBalance}</div>
                </div>
                <div class="roulette-container">
                    <div class="roulette-wheel">
                        <div class="roulette-header">🎲 O先生のルーレット 🎲</div>
                        <div class="roulette-wheel-inner" id="roulette-wheel">
                            <div class="roulette-ball" id="roulette-ball"></div>
                            <div class="roulette-center"></div>
                        </div>
                        <div class="roulette-display" id="roulette-result">?</div>
                    </div>
                    <div class="roulette-bet-table">
                        <div class="roulette-bet-table-header">🎯 ベットテーブル 🎯</div>
                        <div class="roulette-numbers" id="roulette-numbers"></div>
                        <div class="roulette-bets">
                            <div class="roulette-bet" data-bet="red" onclick="otsukaSenseiChat.selectRouletteBet('red')">🔴 赤 (2倍)</div>
                            <div class="roulette-bet" data-bet="black" onclick="otsukaSenseiChat.selectRouletteBet('black')">⚫ 黒 (2倍)</div>
                            <div class="roulette-bet" data-bet="green" onclick="otsukaSenseiChat.selectRouletteBet('green')">🟢 緑 (14倍)</div>
                        </div>
                        <div class="roulette-bet-amount">
                            <label>ベット額:</label>
                            <input type="number" id="roulette-bet-amount" value="10" min="1" max="${this.casinoBalance}">
                        </div>
                        <div class="roulette-controls">
                            <button class="roulette-spin-btn" onclick="otsukaSenseiChat.spinRoulette()">🎲 スピン 🎲</button>
                            <button class="blackjack-btn" onclick="otsukaSenseiChat.closeGameModal()">終了</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        this.createRouletteNumbers();
    }
    
    createRouletteNumbers() {
        const numbersContainer = document.getElementById('roulette-numbers');
        const numbers = [];
        
        // 0を追加
        numbers.push({ num: 0, color: 'green' });
        
        // 1-36を追加
        for (let i = 1; i <= 36; i++) {
            const color = this.getRouletteNumberColor(i);
            numbers.push({ num: i, color: color });
        }
        
        // 数字を配置（3行×12列 + 0）
        let html = '';
        
        // 0のセル
        html += `<div class="roulette-number zero" onclick="otsukaSenseiChat.selectRouletteNumber(0)">0</div>`;
        
        // 1-36のセル（3行×12列）
        for (let row = 0; row < 3; row++) {
            for (let col = 0; col < 12; col++) {
                const index = row * 12 + col + 1;
                if (index <= 36) {
                    const number = numbers[index];
                    html += `<div class="roulette-number ${number.color}" onclick="otsukaSenseiChat.selectRouletteNumber(${number.num})">${number.num}</div>`;
                }
            }
        }
        
        numbersContainer.innerHTML = html;
    }
    
    getRouletteNumberColor(number) {
        const redNumbers = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];
        if (number === 0) return 'green';
        return redNumbers.includes(number) ? 'red' : 'black';
    }
    
    selectRouletteNumber(number) {
        // 既存の選択をクリア
        document.querySelectorAll('.roulette-number').forEach(num => {
            num.classList.remove('selected');
        });
        
        // 新しい選択をマーク
        const selectedElement = document.querySelector(`.roulette-number:nth-child(${number + 1})`);
        if (selectedElement) {
            selectedElement.classList.add('selected');
        }
        
        this.rouletteSelectedNumber = number;
    }
    
    selectRouletteBet(betType) {
        // 既存の選択をクリア
        document.querySelectorAll('.roulette-bet').forEach(bet => {
            bet.classList.remove('selected');
        });
        
        // 新しい選択をマーク
        document.querySelector(`[data-bet="${betType}"]`).classList.add('selected');
        this.rouletteSelectedBet = betType;
    }
    
    spinRoulette() {
        if (!this.rouletteSelectedBet && this.rouletteSelectedNumber === undefined) {
            alert('ベットを選択してください');
            return;
        }
        
        const betAmount = parseInt(document.getElementById('roulette-bet-amount').value);
        if (betAmount > this.casinoBalance) {
            alert('残高が不足しています');
            return;
        }
        
        this.casinoBalance -= betAmount;
        this.updateCasinoBalance();
        
        // スピンボタンを無効化
        const spinBtn = document.querySelector('.roulette-spin-btn');
        spinBtn.disabled = true;
        spinBtn.textContent = '🎲 スピン中... 🎲';
        
        // ルーレットホイールとボールのアニメーション
        const wheel = document.getElementById('roulette-wheel');
        const ball = document.getElementById('roulette-ball');
        const resultElement = document.getElementById('roulette-result');
        
        wheel.classList.add('spinning');
        ball.classList.add('spinning');
        // 結果表示枠は回転させない
        
        setTimeout(() => {
            // ルーレット結果
            const result = Math.floor(Math.random() * 37); // 0-36
            let resultColor = this.getRouletteNumberColor(result);
            let resultText = result.toString();
            
            // 結果表示
            resultElement.textContent = resultText;
            resultElement.style.color = resultColor === 'red' ? '#FF6B6B' : resultColor === 'black' ? '#2c3e50' : '#27ae60';
            wheel.classList.remove('spinning');
            ball.classList.remove('spinning');
            
            // 勝敗判定
            let winAmount = 0;
            let message = '';
            
            // 色ベットの判定
            if (this.rouletteSelectedBet === resultColor) {
                const multiplier = resultColor === 'green' ? 14 : 2;
                winAmount = betAmount * multiplier;
                message = `当たり！${multiplier}倍`;
                this.addWinnerEffect();
            }
            // 数字ベットの判定
            else if (this.rouletteSelectedNumber === result) {
                winAmount = betAmount * 35; // 35倍
                message = `当たり！35倍`;
                this.addWinnerEffect();
            } else {
                message = 'はずれ...';
            }
            
            this.casinoBalance += winAmount;
            this.updateCasinoBalance();
            
            const resultDiv = document.createElement('div');
            resultDiv.className = `casino-result ${winAmount > 0 ? 'win' : 'lose'}`;
            resultDiv.textContent = `${message} ${winAmount > 0 ? '+' + winAmount : ''}`;
            this.gameContent.querySelector('.casino-container').appendChild(resultDiv);
            
            // ボタンを再有効化
            spinBtn.disabled = false;
            spinBtn.textContent = '🎲 スピン 🎲';
            
            // 選択をリセット
            this.rouletteSelectedBet = null;
            this.rouletteSelectedNumber = undefined;
            document.querySelectorAll('.roulette-bet').forEach(bet => {
                bet.classList.remove('selected');
            });
            document.querySelectorAll('.roulette-number').forEach(num => {
                num.classList.remove('selected');
            });
            
            setTimeout(() => {
                resultDiv.remove();
            }, 3000);
        }, 3000);
    }
}

// ページ読み込み完了時にチャットを初期化
let otsukaSenseiChat;
document.addEventListener('DOMContentLoaded', () => {
    otsukaSenseiChat = new OtsukaSenseiChat();
});

// 音声合成の初期化（Chrome用）
if ('speechSynthesis' in window) {
    speechSynthesis.onvoiceschanged = () => {
        const voices = speechSynthesis.getVoices();
        console.log('利用可能な音声:', voices.map(v => `${v.name} (${v.lang})`));
    };
} 