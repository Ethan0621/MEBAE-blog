exports.handler = async function(event, context) {
  // NETLIFY_API_TOKEN は Netlify の環境変数に設定
  var token = process.env.NETLIFY_API_TOKEN;
  var siteId = process.env.SITE_ID;

  if (!token || !siteId) {
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ count: 0 })
    };
  }

  try {
    // Netlify API でフォーム一覧を取得
    var formsRes = await fetch('https://api.netlify.com/api/v1/sites/' + siteId + '/forms', {
      headers: { 'Authorization': 'Bearer ' + token }
    });
    var forms = await formsRes.json();

    // "follow" フォームを探す
    var followForm = null;
    for (var i = 0; i < forms.length; i++) {
      if (forms[i].name === 'follow') {
        followForm = forms[i];
        break;
      }
    }

    var count = followForm ? (followForm.submission_count || 0) : 0;

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=60'
      },
      body: JSON.stringify({ count: count })
    };
  } catch (err) {
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ count: 0 })
    };
  }
};
