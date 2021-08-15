import React from 'react';
import { minymon } from 'data/config';

export const Minymon = () => (
  <div style={{ position: 'relative', 'z-index': 2147483647 }}>
    <minymon-body
      enableFeed={minymon.enableFeed}
      enableTalk={minymon.enableTalk}
      idsString={minymon.idsString}
      infoTitle={minymon.infoTitle}
      theme={minymon.themeColor}
    >
      {minymon.questions.map(({ question, answer }) => (
        <minymon-question question={question} theme={minymon.themeColor}>
          <minymon-answer answer={answer} question={question} theme={minymon.themeColor}></minymon-answer>
        </minymon-question>
      ))}
      <minymon-feedback
        description={minymon.feedback.text}
        mid={minymon.feedback.mid}
        theme={minymon.themeColor}
        uid={minymon.feedback.uid}
      ></minymon-feedback>
    </minymon-body>
  </div>
);
