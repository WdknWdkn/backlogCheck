function BacklogPolice() {
  var response = fetchBacklogIssues();
  console.log(response.length);
  postSlack(JSON.parse(response));
}

var backlogNamespace = 'zzzzzzzzzzzz'; // バックログのスペース名
var backlogUrl = 'https://' + backlogNamespace + '.backlog.com/';

function fetchBacklogIssues() {
  var baseUrl = backlogUrl + 'api/v2/issues';
  var apiKey = 'XXXXX'// 個人アカウント発行
  // 取得対象のプロジェクトIDのリストを指定
  var projectIds = [xxxxx];// プロジェクトID
  var statusIds = [0, 1, 2, 3];// 各状態ID
  var sysdate = new Date();
  sysdate.setDate(sysdate.getDate() - 1);
  var params = {
    'apiKey': apiKey,
    'dueDateUntil': formatDate(sysdate)
  };
  for (var i = 0; i < projectIds.length; i++) {
    params['projectId[' + i + ']'] = projectIds[i];
  }
  for (var i = 0; i < statusIds.length; i++) {
    params['statusId[' + i + ']'] = statusIds[i];
  }  
  var paramString = '';
  for (var key in params) {
    if (0 < paramString.length) {
      paramString += '&';
    }
    paramString += key + '=' + params[key];
  }
  // paramString += '&sort=assignee&dueDate&order=true';//期限日順
  paramString += '&sort=assignee';//担当者順

  return UrlFetchApp.fetch(baseUrl + '?' + paramString);
}

function postSlack(issues) {
  if (issues.length <= 0) {
    return;
  }
  console.log(issues.length);

  const postUrl = 'xxxxxxx';// slackのincoming webhook用
  const username = 'botbot';  // 通知時に表示されるユーザー名
  const icon = ':hatching_chick:';  // 通知時に表示されるアイコン
  
  const subject = '【Backlogのタスクが期限切れになっています！】'//この辺はご自由に
  const body  = '' + subject + '\n' + createPostMessage(issues) + '\n';

  const jsonData =
  {
     "username" : username,
     "icon_emoji": icon,
     "text" : body
  };

  const options =
  {
    "method" : "post",
    "contentType" : "application/json",
    "payload" : JSON.stringify(jsonData)
  };

  UrlFetchApp.fetch(postUrl, options);
}

function createPostMessage(issues) {
  var message = '';
  for (var i = 0; i < issues.length; i++) {
    var issue = issues[i];
    // message += formatDate(new Date(issue.dueDate)) + ', ';
    message += issue.assignee.name + '：';
    message += issue.summary;
    message += '（' + issue.status.name + '）\n';
    message += backlogUrl + 'view/' + issue.issueKey   + '\n\n';
  }
  return message;
}

function formatDate(date) {
  var format = 'YYYY-MM-DD';
  format = format.replace(/YYYY/g, date.getFullYear());
  format = format.replace(/MM/g, ('0' + (date.getMonth() + 1)).slice(-2));
  format = format.replace(/DD/g, ('0' + date.getDate()).slice(-2));
  return format;
}
