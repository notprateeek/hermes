import type { QaAnswer } from "../lib/types";

export type ChatTurn = {
  id: string;
  question: string;
  answer: QaAnswer;
};

type Props = {
  disabled: boolean;
  busy: boolean;
  turns: ChatTurn[];
  suggestions?: string[];
  onAsk: (question: string) => void;
};

const fallbackQuestions = [
  "Can payment be delayed?",
  "What penalties apply?",
  "What should I clarify before signing?"
];

export function AskHermes({ disabled, busy, turns, suggestions, onAsk }: Props) {
  const questions = suggestions?.length ? suggestions : fallbackQuestions;

  return (
    <section className="flex flex-col gap-3 border-t border-border bg-surface p-4">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-text-primary">Ask Hermes</h3>
        <span className="rounded-md border border-border bg-surface-raised px-2 py-1 text-xs text-text-muted">
          {disabled ? "Analyze first" : "Grounded on this agreement"}
        </span>
      </div>

      <div className="flex flex-wrap gap-2">
        {questions.slice(0, 5).map((question, index) => (
          <button
            key={`${question}-${index}`}
            type="button"
            className="rounded-md border border-border bg-surface-raised px-3 py-2 text-xs font-medium text-text-muted transition-colors hover:border-clause hover:text-text-primary"
            onClick={() => onAsk(question)}
            disabled={disabled || busy}
          >
            {question}
          </button>
        ))}
      </div>

      <form
        className="flex gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          if (disabled || busy) return;
          const form = new FormData(event.currentTarget);
          const question = String(form.get("question") || "");
          event.currentTarget.reset();
          onAsk(question);
        }}
      >
        <input
          name="question"
          className="min-w-0 flex-1 rounded-lg border border-border bg-surface-raised px-3 py-2 text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-clause transition-colors"
          placeholder="Ask about deadlines, penalties, exclusions, payment triggers…"
          disabled={disabled || busy}
        />
        <button
          type="submit"
          className="rounded-lg bg-clause px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-clause/90"
          disabled={disabled || busy}
        >
          {busy ? "Asking…" : "Ask"}
        </button>
      </form>

      {turns.length ? (
        <div className="max-h-64 overflow-auto rounded-lg border border-border bg-surface-raised">
          {turns.map((turn) => (
            <article key={turn.id} className="border-b border-border p-3 last:border-b-0">
              <h4 className="text-sm font-semibold text-text-primary">{turn.question}</h4>
              <p className="mt-2 text-sm leading-5 text-text-muted">{turn.answer.answer}</p>
              <dl className="mt-3 grid gap-2 text-xs text-text-muted md:grid-cols-3">
                <div>
                  <dt className="font-semibold text-text-primary">Agreement says</dt>
                  <dd className="mt-1">{turn.answer.whatTheAgreementSays || "Not answered by the agreement."}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-text-primary">Unclear</dt>
                  <dd className="mt-1">{turn.answer.whatIsUnclear || "No extra uncertainty stated."}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-text-primary">Next step</dt>
                  <dd className="mt-1">{turn.answer.recommendedNextStep || "No next step suggested."}</dd>
                </div>
              </dl>
            </article>
          ))}
        </div>
      ) : null}
    </section>
  );
}
