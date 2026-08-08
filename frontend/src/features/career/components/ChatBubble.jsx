import { Fragment } from 'react';

const URL_RE = /(https?:\/\/[^\s)]+)/g;

function withLinks(text) {
  const parts = String(text).split(URL_RE);
  return parts.map((part, i) => {
    if (part.match(URL_RE)) {
      return (
        <a
          key={i}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-blue-600 underline underline-offset-2 hover:text-blue-700"
        >
          {part}
        </a>
      );
    }
    return part;
  });
}

function withBold(parts) {
  return parts.map((part, i) =>
    typeof part === 'string' ? (
      <Fragment key={i}>
        {String(part).split(/(\*\*[^*]+\*\*)/g).map((chunk, j) => {
          if (chunk.startsWith('**') && chunk.endsWith('**')) {
            return (
              <strong key={j} className="font-bold text-slate-900">
                {withLinks(chunk.slice(2, -2))}
              </strong>
            );
          }
          return withLinks(chunk);
        })}
      </Fragment>
    ) : (
      <Fragment key={i}>{part}</Fragment>
    ),
  );
}

function renderMarkdown(text) {
  const lines = String(text).split('\n');
  const nodes = [];
  let list = null;
  let listType = null;

  const flushList = (key) => {
    if (list) {
      nodes.push(
        <ul
          key={key}
          className={`my-2 space-y-1 pl-4 ${listType === 'ol' ? 'list-decimal' : 'list-disc'}`}
        >
          {list.map((item, i) => (
            <li key={i} className="marker:text-blue-400">
              {withBold([item])}
            </li>
          ))}
        </ul>,
      );
      list = null;
      listType = null;
    }
  };

  lines.forEach((line, i) => {
    const trimmed = line.trim();

    const bullet = trimmed.match(/^[-*•]\s+(.*)$/);
    if (bullet) {
      if (listType !== 'ul') {
        flushList(`pre-${i}`);
        list = [];
        listType = 'ul';
      }
      list.push(bullet[1]);
      return;
    }

    const numbered = trimmed.match(/^\d+[.)]\s+(.*)$/);
    if (numbered) {
      if (listType !== 'ol') {
        flushList(`pre-${i}`);
        list = [];
        listType = 'ol';
      }
      list.push(numbered[1]);
      return;
    }

    flushList(`mid-${i}`);

    const heading = trimmed.match(/^#{1,3}\s+(.*)$/);
    if (heading) {
      nodes.push(
        <p key={i} className="mt-2 font-bold text-slate-900">
          {withBold([heading[1]])}
        </p>,
      );
      return;
    }

    const boldOnly = trimmed.replace(/\*\*/g, '').trim();
    const hr = trimmed.replace(/^[-=*]{3,}$/, '');
    if (trimmed !== '' && hr === '' ) {
      nodes.push(<hr key={i} className="my-2 border-slate-100" />);
      return;
    }

    if (trimmed === '') {
      nodes.push(<div key={i} className="h-2" />);
      return;
    }

    nodes.push(<p key={i} className="min-h-[1.25em]">{withBold([boldOnly])}</p>);
  });

  flushList('final');

  return nodes;
}

export default function ChatBubble({ role, content }) {
  const isUser = role === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
          isUser
            ? 'rounded-br-md bg-blue-600 text-white'
            : 'rounded-bl-md border border-slate-100 bg-white text-slate-700'
        }`}
      >
        {isUser ? content : renderMarkdown(content)}
      </div>
    </div>
  );
}
