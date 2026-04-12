exports.handler = async function(event, context) {
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
    var formsRes = await fetch('https://api.netlify.com/api/v1/sites/' + siteId + '/forms', {
      headers: { 'Authorization': 'Bearer ' + token }
    });
    var forms = await formsRes.json();

    if (!Array.isArray(forms)) {
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ count: 0 })
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
