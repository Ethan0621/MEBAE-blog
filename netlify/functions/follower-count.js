exports.handler = async function(event, context) {
  var token = process.env.NETLIFY_API_TOKEN;
  var siteId = process.env.SITE_ID;

  if (!token || !siteId) {
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ count: 0, debug: 'missing_env', hasToken: !!token, hasSiteId: !!siteId })
    };
  }

  try {
    var formsRes = await fetch('https://api.netlify.com/api/v1/sites/' + siteId + '/forms', {
      headers: { 'Authorization': 'Bearer ' + token }
    });
    var formsText = await formsRes.text();
    var forms;
    try { forms = JSON.parse(formsText); } catch(e) { 
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ count: 0, debug: 'parse_error', status: formsRes.status, response: formsText.substring(0, 200) })
      };
    }

    if (!Array.isArray(forms)) {
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ count: 0, debug: 'not_array', response: JSON.stringify(forms).substring(0, 200) })
      };
    }

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
      body: JSON.stringify({ count: count, formFound: !!followForm, totalForms: forms.length })
    };
  } catch (err) {
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ count: 0, debug: 'error', message: err.message })
    };
  }
};
