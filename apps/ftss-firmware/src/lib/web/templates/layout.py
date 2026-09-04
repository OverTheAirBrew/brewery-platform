CSS = """"""

def page(title: str, content: str) -> str:
  return (
    "<!DOCTYPE html>"
    "<html>"
    "<head>"
    f"<title>{title}</title>"
    f"<style>{CSS}</style>"
    "</head>"
    "<body>"
    f"{content}"
    "</body>"
    "</html>"
  )
  
def msg_banner(msg: str, kind: str) -> str:
  return f'<div class="banner {kind}">{msg}</div>'

def esc(value:str):
  return (
    str(value)
      .replace("&", "&amp;")
      .replace("<", "&lt;")
      .replace(">", "&gt;")
      .replace('"', "&quot;")
      .replace("'", "&#x27;")
  )