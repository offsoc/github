import CodeMirror from 'codemirror';
import 'codemirror-graphql/mode';

// If there's a graphql textarea, highlight it with codemirror
var textareas = document.querySelectorAll(".highlight-graphql")
var textarea, i
for (i = 0; i < textareas.length; i++) {
  textarea = textareas[i]
  CodeMirror.fromTextArea(textarea, {
    mode: 'graphql',
    theme: "elegant",
    readOnly: true,
    cursorBlinkRate: -1,
  });
}

function warnDelete(ev, objectName, deletePath) {
  var performDelete = confirm("Are you sure you want to delete this " + objectName + "?\n\nThis change cannot be undone and any clients who depend on this may break.")
  ev.preventDefault()
  if (performDelete) {
    var form = document.createElement("form")
    form.method = "POST"
    form.action = deletePath
    document.body.appendChild(form)
    form.submit();
  }
}

function archiveChecked(makeArchived, operationDigest) {
  var checkedBoxes = document.querySelectorAll(".archive-check:checked")

  var message = makeArchived ?
    "Are you sure you want to archive these operations? (This may disrupt client activity if they are in use.)" :
    "Are you sure you want to unarchive these operations? (Clients may begin using them again.)"
  if ((operationDigest || checkedBoxes.length) && confirm(message)) {
    var archiveValues = []
    if (operationDigest) {
      archiveValues.push(operationDigest)
    } else {
      for (i = 0; i < checkedBoxes.length; i++) {
        archiveValues.push(checkedBoxes[i].value)
      }
    }
    var form = document.createElement("form")
    form.hidden = "true"
    form.method = "POST"
    var pathSuffix = makeArchived ? "/archive" : "/unarchive"
    var pathPrefix = document.location.pathname
    pathPrefix = pathPrefix.replace(/\/archived$/, "")
    form.action = pathPrefix + pathSuffix
    var valuesInput = document.createElement("input")
    valuesInput.name = "values"
    valuesInput.value = archiveValues.join(",")
    form.appendChild(valuesInput)

    document.body.appendChild(form)
    form.submit()
  }
}

var dates = document.querySelectorAll(".localize-date")
var dateElement, dateStr, dateVal
for (i = 0; i < dates.length; i ++) {
  dateElement = dates[i]
  dateStr = dateElement.getAttribute("datetime")
  dateVal = new Date(dateStr)
  dateElement.innerText = dateVal.toLocaleString()
}
// Make it global
window.warnDelete = warnDelete
window.archiveChecked = archiveChecked
