/* カレンダー機能 */
var calYear = new Date().getFullYear();
var calMonth = new Date().getMonth();

function renderCalendar() {
  var title = document.getElementById('calendarTitle');
  var container = document.getElementById('calendarDays');
  if (!title || !container) return;

  title.textContent = '\uD83D\uDCC5 ' + calYear + '年' + (calMonth + 1) + '月';

  var firstDay = new Date(calYear, calMonth, 1).getDay();
  var daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
  var today = new Date();
  var html = '';
  var i, day, pi, dayOfWeek;

  for (i = 0; i < firstDay; i++) {
    html += '<div class="calendar-day other-month">&nbsp;</div>';
  }

  for (day = 1; day <= daysInMonth; day++) {
    var ds = calYear + '-' + String(calMonth + 1).padStart(2, '0') + '-' + String(day).padStart(2, '0');
    var posts = (typeof CALENDAR_MAP !== 'undefined') ? CALENDAR_MAP[ds] : null;
    var isToday = (today.getFullYear() === calYear && today.getMonth() === calMonth && today.getDate() === day);
    dayOfWeek = (firstDay + day - 1) % 7;
    var cls = 'calendar-day';

    if (dayOfWeek === 0) { cls += ' sunday'; }
    if (dayOfWeek === 6) { cls += ' saturday'; }
    if (isToday) { cls += ' today'; }

    if (posts && posts.length > 0) {
      cls += ' has-post';
      var tooltipParts = [];
      for (pi = 0; pi < posts.length; pi++) {
        tooltipParts.push(posts[pi].title);
      }
      var tooltip = tooltipParts.join(' / ');
      html += '<div class="' + cls + '" title="' + tooltip.replace(/"/g, '&quot;') + '" onclick="location.href=\'/posts/' + posts[0].slug + '/\'">' + day + '</div>';
    } else {
      html += '<div class="' + cls + '">' + day + '</div>';
    }
  }
  container.innerHTML = html;
}

function changeMonth(delta) {
  if (delta === 0) {
    calYear = new Date().getFullYear();
    calMonth = new Date().getMonth();
  } else {
    calMonth += delta;
    if (calMonth < 0) { calMonth = 11; calYear--; }
    if (calMonth > 11) { calMonth = 0; calYear++; }
  }
  renderCalendar();
}

document.addEventListener('DOMContentLoaded', renderCalendar);
