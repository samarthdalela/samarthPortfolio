export default function Terminal() {
  return (
    <div className="terminal" aria-hidden="true">
      <div className="terminal-bar">
        <span className="dot red" />
        <span className="dot yellow" />
        <span className="dot green" />
        <span className="terminal-title">samarth@nielit: ~</span>
      </div>
      <pre className="terminal-body">
        <code>
          <span className="t-prompt">$</span> cat developer.json{'\n'}
          {'{'}{'\n'}
          {'  '}<span className="t-key">"name"</span>: <span className="t-str">"Samarth Dalela"</span>,{'\n'}
          {'  '}<span className="t-key">"role"</span>: <span className="t-str">"Software Developer"</span>,{'\n'}
          {'  '}<span className="t-key">"at"</span>: <span className="t-str">"NIELIT HQ, New Delhi"</span>,{'\n'}
          {'  '}<span className="t-key">"stack"</span>: [<span className="t-str">"Node"</span>, <span className="t-str">"React"</span>, <span className="t-str">"MySQL"</span>, <span className="t-str">"Kafka"</span>],{'\n'}
          {'  '}<span className="t-key">"ops"</span>: [<span className="t-str">"Nginx"</span>, <span className="t-str">"PM2"</span>, <span className="t-str">"CI/CD"</span>],{'\n'}
          {'  '}<span className="t-key">"security"</span>: <span className="t-str">"OWASP Top 10"</span>,{'\n'}
          {'  '}<span className="t-key">"openToWork"</span>: <span className="t-bool">true</span>{'\n'}
          {'}'}{'\n'}
          <span className="t-prompt">$</span> <span className="t-cursor" />
        </code>
      </pre>
    </div>
  )
}
