export function makeIcon(icon: string, className="") {
  // TODO: make symbol-filled a separate option, or specify it explicitly.
  return (
    <span
      className={"material-symbols-rounded symbol-filled " + className}
      style={{display: "inline-block"}}
    >
      {icon}
    </span>
  );
}

export function makeIconHeader(icon: string, header: string, containerClassName="", iconClassName="") {
  return (
    <div className={"hdiv gap " + containerClassName} style={{padding: "2px 0", alignItems: "center"}}>
      {makeIcon(icon, iconClassName)}
      <h3 style={{marginBottom: "0"}}>{header}</h3>
    </div>
  )
}

export function makeLink(text: string, url: string, newTab: boolean = true) {
  if (newTab) {
    return (
      <a target="_blank" href={url} rel="noopener noreferrer">{text}</a>
    );
  } else {
    return (
      <a href={url} rel="noopener noreferrer">{text}</a>
    );
  }
}