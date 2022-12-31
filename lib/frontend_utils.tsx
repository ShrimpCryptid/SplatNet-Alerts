export function makeIcon(icon: string, className="") {
  return (
    <span
      className={"material-symbols-rounded " + className}
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