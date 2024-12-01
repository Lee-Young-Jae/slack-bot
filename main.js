const { App } = require("@slack/bolt");

require("dotenv").config();

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  socketMode: true,
  appToken: process.env.SLACK_APP_TOKEN,
  port: process.env.PORT || 3000,
});
app.message(/시리|빅스비|siri|bigsby|구글|google/, async ({ message, say }) => {
  await say({
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `안녕하세요 <@${message.user}>님! 무엇을 도와드릴까요?`,
        },
      },
      {
        type: "actions",
        elements: [
          {
            type: "button",
            text: {
              type: "plain_text",
              text: "점메추",
            },
            action_id: "button_click",
          },
          {
            type: "button",
            text: {
              type: "plain_text",
              text: "가위바위보",
            },
            action_id: "play_rps",
          },
          {
            type: "button",
            text: {
              type: "plain_text",
              text: "아재개그",
            },
            action_id: "tell_joke",
          },
          {
            type: "button",
            text: {
              type: "plain_text",
              text: "오늘의 운세",
            },
            action_id: "fortune",
          },
          {
            type: "button",
            text: {
              type: "plain_text",
              text: "로또",
            },
            action_id: "lottery",
          },
        ],
      },
    ],
  });
});

app.action("lottery", async ({ body, ack, say }) => {
  await ack();
  await say({
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `<@${body.user.id}> 로또 번호를 뽑아드릴게요`,
        },
      },
      {
        type: "actions",
        elements: [
          {
            type: "button",
            text: {
              type: "plain_text",
              text: "로또 번호 뽑기",
            },
            action_id: "lottery_draw",
          },
        ],
      },
    ],
  });
});

const 점심_메뉴 = ["샐러디", "편의점", "국밥"];

app.action("button_click", async ({ body, ack, say }) => {
  await ack();
  await say(`<@${body.user.id}> 점메추 버튼을 눌렀습니다.`);
  await say(
    `오늘의 점심 메뉴는 ${
      점심_메뉴[Math.floor(Math.random() * 점심_메뉴.length)]
    }입니다.`
  );
});

const 가위바위보_옵션 = ["가위 ✌️", "바위 ✊", "보 ✋"];

// 가위바위보 게임
app.action("play_rps", async ({ body, ack, say }) => {
  await ack();
  const 봇의_선택 = 가위바위보_옵션[Math.floor(Math.random() * 3)];
  await say({
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `<@${body.user.id}> 가위바위보 한 판 하시죠!`,
        },
      },
      {
        type: "actions",
        elements: 가위바위보_옵션.map((옵션) => ({
          type: "button",
          text: {
            type: "plain_text",
            text: 옵션,
          },
          action_id: `rps_${옵션.split(" ")[0]}_${봇의_선택.split(" ")[0]}`,
        })),
      },
    ],
  });
});

// 가위바위보 결과 처리
가위바위보_옵션.forEach((유저옵션) => {
  가위바위보_옵션.forEach((봇옵션) => {
    app.action(
      `rps_${유저옵션.split(" ")[0]}_${봇옵션.split(" ")[0]}`,
      async ({ body, ack, say }) => {
        await ack();
        const resultText = getRPSResultText(
          유저옵션.split(" ")[0],
          봇옵션.split(" ")[0]
        );
        await say(
          `<@${body.user.id}> ${resultText} ${
            resultText === "이겼습니다! 🎉"
              ? "축하드려요!"
              : resultText === "비겼습니다! 🤝"
              ? "한 번 더?"
              : "다음에 또 도전해보세요!"
          }`
        );
      }
    );
  });
});

const jokes = [
  {
    question: "미국에서 비가 내리면",
    answer: "USB",
  },
  {
    question: "미국 갱스터를 뭐라 하는지 아시나요",
    answer: "양갱",
  },
  {
    question: "미국 메이저리그에서 던지는 공은",
    answer: "해외직구",
  },
];

// actions

// 로또 추첨
app.action("lottery_draw", async ({ body, ack, say }) => {
  await ack();
  await say(`<@${body.user.id}> 로또 번호를 뽑아드릴게요`);

  const candidates = Array.from({ length: 45 }, (_, index) => index + 1);
  const 로또_번호 = candidates.sort(() => Math.random() - 0.5).slice(0, 6);

  await say(`<@${body.user.id}> 로또 번호는...
----------------------------
    `);
  for (const 번호 of 로또_번호) {
    await say(`${번호}`);
  }
  await say(`----------------------------
      입니다.
    `);
});

// 아재개그 액션
app.action("tell_joke", async ({ body, ack, say }) => {
  await ack();
  const jokeIndex = Math.floor(Math.random() * jokes.length);
  const joke = jokes[jokeIndex];

  await say({
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `<@${body.user.id}> ${joke.question}?`,
        },
      },
      {
        type: "actions",
        elements: [
          {
            type: "button",
            text: {
              type: "plain_text",
              text: "정답공개",
            },
            action_id: `joke_answer_${jokeIndex}`,
          },
        ],
      },
    ],
  });
});

// 아재개그 정답 처리
jokes.forEach((joke, index) => {
  app.action(`joke_answer_${index}`, async ({ body, ack, say }) => {
    await ack();
    await say(`<@${body.user.id}> ${jokes[index].answer}`);
  });
});

// 오늘의 운세 액션
app.action("fortune", async ({ body, ack, say }) => {
  await ack();
  const 운세_목록 = ["대길 🌟", "길 ⭐", "중길 ✨", "소길 💫", "평범 😊"];
  const 운세 = 운세_목록[Math.floor(Math.random() * 운세_목록.length)];
  const 운세_메시지 = [
    "오늘 코드는 버그 없이 완벽하게 동작할 거예요!",
    "새로운 기술을 배울 좋은 기회가 있을 거예요!",
    "동료들과 즐거운 협업이 기다리고 있어요!",
    "어려운 문제도 쉽게 해결할 수 있을 거예요!",
    "오늘은 평범한 하루가 될 거예요!",
    "오늘은 조금 힘든 하루가 될 거예요!",
    "오늘은 무언가 잘못될 수도 있어요!",
    "오늘은 무언가 좋은 일이 있을 거예요!",
  ];
  const 메시지 = 운세_메시지[Math.floor(Math.random() * 운세_메시지.length)];

  await say(`<@${body.user.id}> 오늘의 운세는... ${운세}\n${메시지}`);
});

// 가위바위보 승패 판정 함수
const getRPSResultText = (유저, 봇) => {
  if (유저 === 봇) return "비겼습니다! 🤝";
  if (
    (유저 === "가위" && 봇 === "보") ||
    (유저 === "바위" && 봇 === "가위") ||
    (유저 === "보" && 봇 === "바위")
  )
    return "이겼습니다! 🎉";
  return "졌습니다! 😢";
};

(async () => {
  await app.start();

  console.log("⚡️ Bolt app is running!");
})();
