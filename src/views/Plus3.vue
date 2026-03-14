<script setup lang="ts">
import { computed, ref, onMounted, nextTick } from 'vue'
import { broadcastAnswer } from '@/services/messageService';
import { useIdentityStore } from '@/stores/useIdentityStore';
import * as bootstrap from 'bootstrap'

const store = useIdentityStore();

interface Question {
  id: number
  num1: number
  num2: number
  num3: number
  answer: number
  choices: number[]
  isSolved: boolean
  wrongAttempt: boolean
}

const questions = ref<Question[]>([])
const nextId = ref(1)
const finished = ref<number[]>([]);
const showCelebration = ref(false)
const globalShake = ref(false)
const SuccessCounter = ref(0);
const ErrorCounter = ref(0);
const Score = computed(() => {
  var correct = SuccessCounter.value;
  var error = ErrorCounter.value;
  if (error == 0) {
    return correct;
  }

  var correctionPower = parseInt((correct / 2).toString());
  error = correctionPower > error ?
    0 :
    error - correctionPower;
  return correct - error;
});

const generateQuestion = () => {
  let num1 = 0, num2 = 0, num3 = 0, answer = 0;

  do {
    num1 = Math.floor(Math.random() * 7) + 1; // 1 ~ 7
    num2 = Math.floor(Math.random() * 7) + 1;
    num3 = Math.floor(Math.random() * 7) + 1;
    answer = num1 + num2 + num3;
  } while (num1 === 7 && num2 === 7 && num3 === 7); // 例外：排除三個7

  // Generate 4 unique random numbers for wrong choices (範圍約 3 ~ 21)
  const wrongChoices = new Set<number>()
  while (wrongChoices.size < 4) {
    const val = Math.floor(Math.random() * 19) + 3 // 3 到 21 之間隨機
    if (val !== answer) wrongChoices.add(val)
  }

  const choices = [answer, ...Array.from(wrongChoices)].sort(() => Math.random() - 0.5)

  questions.value.push({
    id: nextId.value++,
    num1,
    num2,
    num3,
    answer,
    choices,
    isSolved: false,
    wrongAttempt: false
  })
}
const checkAnswer = async (question: Question, choice: number) => {
  if (choice === question.answer) {
    if (finished.value.includes(question.id)) return;
    finished.value.push(question.id);
    question.isSolved = true
    question.wrongAttempt = false
    SuccessCounter.value++
    showCelebration.value = true;
    if (store.imagePath) {
      await broadcastAnswer(
        store.imagePath,
        question.num1 + ' + ' + question.num2 + ' + ' + question.num3 + ' = ' + question.answer + ' (' + Score.value + '分)',
        'good'
      );
    }
    if (SuccessCounter.value === 1) { // 第一次出現時初始化
      nextTick(() => {
        const el = document.querySelector('[data-bs-toggle="popover"]')
        if (el) new bootstrap.Popover(el)
      })
    }
    setTimeout(() => {
      showCelebration.value = false
      setTimeout(() => {
        questions.value = questions.value.filter(q => q.id !== question.id)
      }, 800)
    }, 1500)
  } else {
    globalShake.value = true
    question.wrongAttempt = true
    ErrorCounter.value++;
    if (store.imagePath) {
      await broadcastAnswer(
        store.imagePath,
        question.num1 + ' + ' + question.num2 + ' + ' + question.num3 + ' = ' + choice + ' (' + Score.value + '分)',
        'bad'
      );
    }
    setTimeout(() => {
      globalShake.value = false
      question.wrongAttempt = false
    }, 500)
  }
}

</script>

<template>
  <div :class="['mx-0 my-auto p-1', { 'shake-animation': globalShake }]">
    <div class="fs-3 text-center mt-0 mb-3" v-if="SuccessCounter > 0 || ErrorCounter > 0">
      <div class="">
        <div>
          <span class="text-success">答對：{{ SuccessCounter }}</span>
          <span class="text-danger">答錯：{{ ErrorCounter }}</span>
          <span class="text-primary border border-primary rounded ms-2" data-bs-toggle="popover" title="總分怎麼算？"
            data-bs-content="正確+1，答錯-1，每答對2題可以抵銷一個錯誤">總分：{{ Score }} </span>
        </div>
      </div>
    </div>
    <div class="header-section text-center mb-2">
      <div class="add-btn-wrapper" @click="generateQuestion">
        <img src="@/assets/new_question_button_1772156944982.png" alt="New Question" class="new-q-img">
        <div class="hover-tip">點我出題！</div>
      </div>
    </div>

    <TransitionGroup name="list" tag="div" class="questions-list">
      <div v-for="q in questions" :key="q.id"
        :class="['d-flex align-items-center border border-primary question-row', { 'solved': q.isSolved, 'wrong-row': q.wrongAttempt }]">
        <div class="p-2 w-100 row d-flex align-items-center justify-content-center math-expression">
          <div class="col-12 col-md-auto">
            <span class="digit">{{ q.num1 }}</span>
            <span class="operator">+</span>
            <span class="digit">{{ q.num2 }}</span>
            <span class="operator">+</span>
            <span class="digit">{{ q.num3 }}</span>
            <span class="operator">=</span>
            <span class="digit">?</span>
          </div>
          <div class="col-12 col-md-auto justify-content-between gap-2">
            <button v-for="choice in q.choices" :key="choice" @click="checkAnswer(q, choice)" class="choice-btn">
              {{ choice }}
            </button>
          </div>
        </div>
      </div>
    </TransitionGroup>

    <div v-if="showCelebration" class="celebration-overlay">
      <div class="stars">✨🌟🎆⭐✨</div>
      <div class="happy-face">🥰太棒了！</div>
    </div>
  </div>
</template>

<style scoped>
.add-btn-wrapper {
  cursor: pointer;
  display: inline-block;
  transition: transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  position: relative;
}

.add-btn-wrapper:hover {
  transform: scale(1.1) rotate(5deg);
}

.add-btn-wrapper:active {
  transform: scale(0.95);
}

.new-q-img {
  width: 120px;
  height: 120px;
  filter: drop-shadow(0 10px 15px rgba(0, 0, 0, 0.1));
  border-radius: 20px;
}

.hover-tip {
  position: absolute;
  top: -30px;
  left: 50%;
  transform: translateX(-50%);
  background: #ff6b6b;
  color: white;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 14px;
  opacity: 0;
  transition: opacity 0.3s;
  pointer-events: none;
  white-space: nowrap;
}

.add-btn-wrapper:hover .hover-tip {
  opacity: 1;
}

.questions-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.question-row {
  background: white;
  border-radius: 24px;
  border-color: #f0f0f0;
  transition: all 0.5s ease;
}

.question-row.solved {
  background: #e3f9e5;
  border-color: #51cf66;
  opacity: 0;
  transform: translateY(-20px) scale(0.9);
}

.math-expression {
  font-size: 42px;
  font-weight: 800;
  color: #333;
  font-family: 'Comic Sans MS', 'Chalkboard SE', cursive;
}

.digit {
  color: #d13a5a;
}

.operator {
  color: #ff922b;
}

.choice-btn {
  width: 60px;
  height: 60px;
  border-radius: 18px;
  border: none;
  background: #f8f9fa;
  font-size: 24px;
  font-weight: 700;
  color: #495057;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  box-shadow: 0 4px 0 #dee2e6;
}

.choice-btn:hover {
  background: #edf2ff;
  transform: translateY(-2px);
  box-shadow: 0 6px 0 #d0bfff;
}

.choice-btn:active {
  transform: translateY(4px);
  box-shadow: 0 0 0 transparent;
}

/* Animations */
.shake-animation {
  animation: global-shake 0.5s ease;
}

@keyframes global-shake {

  0%,
  100% {
    transform: translateX(0);
  }

  10%,
  30%,
  50%,
  70%,
  90% {
    transform: translateX(-10px);
  }

  20%,
  40%,
  60%,
  80% {
    transform: translateX(10px);
  }
}

.celebration-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  pointer-events: none;
  animation: fade-in 0.3s ease;
}

.stars {
  font-size: 60px;
  animation: bounce 0.5s infinite alternate;
}

.happy-face {
  font-size: 48px;
  font-weight: bold;
  color: #ff6b6b;
  margin-top: 20px;
}

@keyframes bounce {
  from {
    transform: translateY(0);
  }

  to {
    transform: translateY(-20px);
  }
}

@keyframes fade-in {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

/* Transition Group */
.list-enter-active,
.list-leave-active {
  transition: all 0.5s ease;
}

.list-enter-from {
  opacity: 0;
  transform: translateX(-50px);
}

.list-leave-to {
  opacity: 0;
  transform: scale(0.5);
}
</style>
