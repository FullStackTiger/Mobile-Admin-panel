var Product = require('../models/product'); // Import User Model
var jwt = require('jsonwebtoken'); // Import JWT Package
var secret = 'harrypotter'; // Create custom secret for use in JWT
var multer = require('multer');
var User = require('../models/user');
var Visitor = require('../models/visitor');
var Mailgun = require('mailgun-js');
var uploaded_filename;
module.exports = function (router) {
	var storage = multer.diskStorage({ //multers disk storage settings
		destination: function (req, file, cb) {
			cb(null, './public/uploads/')
		},
		filename: function (req, file, cb) {
			var datetimestamp = Date.now();
			uploaded_filename = 'http://localhost:3000/uploads/' + file.fieldname + '-' + datetimestamp + '.' + file.originalname.split('.')[file.originalname.split('.').length - 1];//
			cb(null, file.fieldname + '-' + datetimestamp + '.' + file.originalname.split('.')[file.originalname.split('.').length - 1])
		}
	});
	var upload = multer({ //multer settings
		storage: storage
	}).single('file');
	/** API path that will upload the files */
	router.post('/checkemail', function (req, res) {
		User.findOne({ email: req.body.email }).select('email').exec(function (err, user) {
			if (err) throw err; // Throw err if cannot connect
			if (user) {
				res.json({ success: false, message: 'That e-mail is already taken' }); // If user is returned, then e-mail is taken
			} else {
				res.json({ success: true, message: 'Valid e-mail' }); // If user is not returned, then e-mail is not taken
			}
		});
	});
	var codeDec = [];
	var code = {};
	var banners = [];
	var splashs = [];
	var isFirstB = true;
	var isFirstS = true;
	var codePath = [];
	var completePath = [];
	var aocodes = [];
	var addonCat = {};
	router.post('/users', function (req, res) {
		var user = new User(); // Create new User object
		user.password = req.body.password; // Save password from request to User object
		user.email = req.body.email; // Save email from request to User object
		user.name = req.body.name; // Save name from request to User object
		user.temporarytoken = jwt.sign({ name: user.name, email: user.email }, secret, { expiresIn: '1h' }); // Create a token for activating account through e-mail

		// Check if request is valid and not empty or null
		if (req.body.password === null || req.body.password === '' || req.body.email === null || req.body.email === '' || req.body.name === null || req.body.name === '') {
			res.json({ success: false, message: 'Ensure username, email, and password were provided' });
		} else {
			// Save new user to database
			user.save(function (err) {
				if (err) {
					// Check if any validation errors exists (from user model)
					console.log(err);
					if (err.errors !== null) {
						return;
					} else if (err) {
						// Check if duplication error exists
						if (err.code == 11000) {
							if (err.errmsg[61] == "u") {
								res.json({ success: false, message: 'That username is already taken' }); // Display error if username already taken
							} else if (err.errmsg[61] == "e") {
								res.json({ success: false, message: 'That e-mail is already taken' }); // Display error if e-mail already taken
							}
						} else {
							res.json({ success: false, message: err }); // Display any other error
						}
					}
				} else {
					res.json({ success: true, message: 'Account registered!' }); // Send success message back to controller/request
				}
			});
		}
	});

	router.post('/authenticate', function (req, res) {
		User.findOne({ email: req.body.email }).select('email username password active').exec(function (err, user) {
			if (err) throw err; // Throw err if cannot connect

			// Check if user is found in the database (based on username)           
			if (!user) {
				res.json({ success: false, message: 'User not found' }); // Username not found in database
			} else if (user) {
				// Check if user does exist, then compare password provided by user
				if (!req.body.password) {
					res.json({ success: false, message: 'No password provided' }); // Password was not provided
				} else {
					var validPassword = user.comparePassword(req.body.password); // Check if password matches password provided by user 
					if (!validPassword) {
						res.json({ success: false, message: 'Could not authenticate password' }); // Password does not match password in database
					} else {
						var token = jwt.sign({ name: user.name, email: user.email }, secret, { expiresIn: '1h' }); // Logged in: Give user token
						res.json({ success: true, message: 'User authenticated!', token: token }); // Return token in JSON object to controller
					}
				}
			}
		});
	});
	router.get('/get_users', function (req, res) {
		Visitor.find({}, function (err, results) {
			if (err) {
				res.json({ success: false })
			} else {

				var users = [];
				for (index in results) {
					var user = {};
					if (results[index].confirm_code == "accept") {
						user.email = results[index].email;
						users.push(user);
					}
				}
				res.json({ success: true, users: users });
			}
		})
	});
	router.post('/me', function (req, res) {
		res.send(req.decoded); // Return the token acquired from middleware
	});
	router.post('/save', function (req, res) {
		var data = req.body;
		console.log("ghfhgfhgfhgfhfh", data)
		Product.findOne({}, function (err, product) {
			console.log(data);
			if (product) {
				product.data = data;
				product.save(function (err) {
					if (err) {
						console.log(err);
						res.json({
							success: false
						})
					} else {
						console.log(product.data);
						res.json({
							success: true,
						});
					}
				});
			} else {
				var product = new Product();
				product.data = data;
				product.save(function (err) {
					if (err) {
						res.json({
							success: false
						})
					} else {
						res.json({
							success: false
						});
					}
				})
			}
		});
	});
	var data = [];
	router.post('/save_code', function (req, res) {
		console.log("~~~~~~~~~~~~~~~save code~~~~~~~~~~~~~~~");
		console.log(req.body);
		var which = req.body.which;
		var code_info = req.body.code;
		var isActive = req.body.active;
		data = [];
		Product.findOne({}).exec(function (err, result) {
			console.log("__________________start__________________");
			data = getUpdatedData(result.data, code_info, which, isActive);
			// console.log(data[0].children[0].children[0].children[0]);
			// result.data=data;
			// console.log(result.data[0].children[0].children[0].children[0]);
			result.data = [];
			result.data = data;
			result.save(function (err) {
				if (err) {
					res.json({ success: false });
				} else {
					res.json({ success: true });
				}
			})
		});
	});

	function getUpdatedData(Data, code_info, which, active) {
		for (var i in Data) {
			if (Data[i].roleName == code_info.cname) {
				console.log("____________________________________");
				var tempObj = {};
				tempObj.imageUrl = code_info.imageUrl;
				tempObj.siteUrl = code_info.siteUrl;
				if (active == true) {
					tempObj.active = true;
				} else {
					tempObj.active = false;
				}

				if (which == 0) {
					console.log("_________________detail___________________");
					if (Data[i].detail) {
						Data[i].detail.push(tempObj);
					} else {
						Data[i].detail = [];
						Data[i].detail.push(tempObj);
						console.log(Data[i].detail);
					}
				} else if (which == 1) {
					console.log("_________________splash___________________");
					if (Data[i].splash) {
						Data[i].splash.push(tempObj);
					} else {
						Data[i].splash = [];
						Data[i].splash.push(tempObj);
					}
				} else if (which == 2) {
					console.log("_________________banner___________________");
					if (Data[i].banner) {
						Data[i].banner.push(tempObj);
					} else {
						Data[i].banner = [];
						Data[i].banner.push(tempObj);
					}
				}
				break;
			} else if (Data[i].children.length > 0) {
				getUpdatedData(Data[i].children, code_info, which, active);
			}
		}
		return Data;
	}

	router.get('/get_product', function (req, res) {
		console.log("<<<<<<<<<<<<<<<<<<<<<get product>>>>>>>>>>>>>>>>>>>>>>>>>");
		Product.findOne({}).exec(function (err, result) {
			if (err) {
				console.log(err);
				res.json({
					success: false
				})
			} else {
				if (result) {
					res.json({
						success: true,
						data: result.data
					});
				} else {
					res.json({
						success: true,
						data: null
					});
				}
			}
			console.log(result);
		});
	});

	//upload code detail image
	router.post('/detail_upload', function (req, res) {
		console.log("<<<<<<<<<<<<<<upload file>>>>>>>>>>>>>>>>");
		upload(req, res, function (err) {
			if (err) {
				console.log(err);
				res.json({ error_code: 1, err_desc: err });
				return;
			}
			res.json({
				success: true,
				filename: uploaded_filename
			});
		});
	});
	//Strip payment api
	router.post('/pay', function (req, res) {
		console.log("<<<<<<<<<<<<<<Payment system>>>>>>>>>>>>>>>>");
		var info = req.body;
		var stripe = require('stripe')('pk_test_HZhhjKccbJi0pgBBn5DtvEei');
		stripe.setApiKey('sk_test_3ll4QQuOhJIKG6JlQ70yl0PS');
		stripe.setTimeout(20000); // in ms (default is node's default: 120000ms)
		stripe.customers.create({
			email: info.email
		}).then(function (customer) {
			return stripe.customers.createSource(customer.id, {
				source: {
					object: 'card',
					exp_month: info.month,
					exp_year: info.year,
					number: info.number,
					cvc: info.cvc
				}
			});
		}).then(function (source) {
			return stripe.charges.create({
				amount: 10000,
				currency: 'usd',
				customer: source.customer
			});
		}).then(function (charge) {
			res.json({
				success: true
			});
			// New charge created on a new customer 
		}).catch(function (err) {
			res.json({
				success: true,
				message: err.message
			});
			// Deal with an error 
			return res.end("payment err");
		});



	});

	router.get('/codes', function (req, res) {
		console.log("<<<<<<<<<<<<<<<<get codes>>>>>>>>>>>>>>>>>>>>>");
		codeDes = [];
		console.log("-------------------------");
		console.log(codeDec);
		console.log("-------------------------");
		Product.findOne({}).exec(function (err, result) {
			if (err) return res.json({ success: false });
			if (result) {
				var codes = getCodes(result.data);

				res.json({
					success: true,
					codes: codes.sort(function (a, b) {
						if (a.codeName > b.codeName)
							return 1
						else
							return -1
					})
				})
			}
		});
	});


	router.post('/code', function (req, res) {
		console.log("<<<<<<<<<<<<<<<<get code>>>>>>>>>>>>>>>>>>>>>");
		codePath = [];
		completePath = [];
		aocodes = [];
		addonCat = {};
		if (!req.body.codeName || !req.body.userid) {
			res.json({
				success: false,
				message: 'codeName and userid is needed'
			});
			return;
		}
		Visitor.findOne({ _id: req.body.userid }, function (err, visitor) {
			console.log("<<<<<<<<<<<<<< get code visitor >>>>>>>>>>>>>>>>>>")
			console.log(visitor)
			if (visitor) {
				if (err) return res.json({ success: false });
				Product.findOne({}).exec(function (err, result) {
					console.log("<<<<<<<<<<<<<<< get code product >>>>>>>>>>>>>")
					if (err) return res.json({ success: false });
					var code = getCode(result.data, req.body.codeName);
					var fav = false;
					if (typeof visitor.favorite != null) {
						console.log("come in");
						for (index in visitor.favorite) {

							if (visitor.favorite[index].cname == req.body.codeName) {
								fav = true;
								break;
							}
						}
					}
					console.log("favorite=", fav);
					getAddonCodeArray(req.body.codeName, function (data) {
						res.json({
							success: true,
							code: code,
							favorite: fav,
							addon: data
						})
					});
				});
			} else {
				res.json({
					success: false,
					error: "user does not exist"
				})
			}
		});
	});

	router.get('/treedata', function (req, res) {
		Product.findOne({}).exec(function (err, result) {
			var tempData = result.data;
			tempData = DatawithoutAddon(tempData);
			tempData = allowedData(tempData);
			if (err) return res.json({ success: false });
			res.json({
				success: true,
				data: tempData
			});
		});
	});

	function allowedData(Data) {
		for (index in Data) {
			if (Data[index].roleType == 'code') {
				if (Data[index].detail) {
					for (var i = Data[index].detail.length - 1; i >= 0; i--) {
						if (Data[index].detail[i].active == false) {
							Data[index].detail.splice(i, 1);
						}
					}
				}
				if (Data[index].splash) {
					for (var i = Data[index].splash.length - 1; i >= 0; i--) {
						if (Data[index].splash[i].active == false) {
							Data[index].splash.splice(i, 1);
						}
					}
				}
				if (Data[index].banner) {
					for (var i = Data[index].banner.length - 1; i >= 0; i--) {
						if (Data[index].banner[i].active == false) {
							Data[index].banner.splice(i, 1);
						}
					}
				}
			} else {
				if (Data[index].children.length > 0) {
					allowedData(Data[index].children);
				}
			}
		}
		return Data;
	}

	router.post('/signup', function (req, res) {
		Product.findOne({}).exec(function (err, product) {
			var visitor = new Visitor();
			visitor.email = req.body.email;
			visitor.password = "req.body.password";
			if (visitor.email === null || visitor.email === " " || visitor.password === null || visitor.password === ' ') {
				res.json({ success: false, message: "Ensure email and password were provided" });
				return;
			}
			visitor.confirm_code = Math.floor(100000 + Math.random() * 900000).toString().substring(0, 4);
			console.log(visitor);
			visitor.save(function (err) {
				if (err) {
					console.log(err);
					res.json({ success: false, message: "some error occured." });
					return;
				}
				console.log("saved");
				var domain_url = '';
				var api_key = '';
				var from_who = "";
				var mailgun = new Mailgun({ apiKey: api_key, domain: domain_url });
				var data = {
					from: from_who,
					to: req.body.email,
					subject: 'confirm email',
					html: `<html>
						  <head>
						    <meta name="viewport" content="width=device-width" />
						    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
						    <style>
						      img {
						        border: none;
						        -ms-interpolation-mode: bicubic;
						        max-width: 100%; }
						      body {
						        background-color: #f6f6f6;
						        font-family: sans-serif;
						        -webkit-font-smoothing: antialiased;
						        font-size: 14px;
						        line-height: 1.4;
						        margin: 0;
						        padding: 0; 
						        -ms-text-size-adjust: 100%;
						        -webkit-text-size-adjust: 100%; }
						      table {
						        border-collapse: separate;
						        mso-table-lspace: 0pt;
						        mso-table-rspace: 0pt;
						        width: 100%; }
						        table td {
						          font-family: sans-serif;
						          font-size: 14px;
						          vertical-align: top; }
						      .body {
						        background-color: #f6f6f6;
						        width: 100%; }
						      .container {
						        display: block;
						        Margin: 0 auto !important;
						        /* makes it centered */
						        max-width: 580px;
						        padding: 10px;
						        width: 580px; }
						      .content {
						        box-sizing: border-box;
						        display: block;
						        Margin: 0 auto;
						        max-width: 580px;
						        padding: 10px; }
						      .main {
						        background: #fff;
						        border-radius: 3px;
						        width: 100%; }
						      .wrapper {
						        box-sizing: border-box;
						        padding: 20px; }
						      .footer {
						        clear: both;
						        padding-top: 10px;
						        text-align: center;
						        width: 100%; }
						        .footer td,
						        .footer p,
						        .footer span,
						        .footer a {
						          color: #999999;
						          font-size: 12px;
						          text-align: center; }
						      h1,
						      h2,
						      h3,
						      h4 {
						        color: #000000;
						        font-family: sans-serif;
						        font-weight: 400;
						        line-height: 1.4;
						        margin: 0;
						        Margin-bottom: 30px; }
						      h1 {
						        font-size: 35px;
						        font-weight: 300;
						        text-align: center;
						        text-transform: capitalize; }
						      p,
						      ul,
						      ol {
						        font-family: sans-serif;
						        font-size: 14px;
						        font-weight: normal;
						        margin: 0;
						        Margin-bottom: 15px; }
						        p li,
						        ul li,
						        ol li {
						          list-style-position: inside;
						          margin-left: 5px; }
						      a {
						        color: #3498db;
						        text-decoration: underline; }
						      .btn {
						        box-sizing: border-box;
						        width: 100%; }
						        .btn > tbody > tr > td {
						          padding-bottom: 15px; }
						        .btn table {
						          width: auto; }
						        .btn table td {
						          background-color: #ffffff;
						          border-radius: 5px;
						          text-align: center; }
						        .btn a {
						          background-color: #ffffff;
						          border: solid 1px #3498db;
						          border-radius: 5px;
						          box-sizing: border-box;
						          color: #3498db;
						          cursor: pointer;
						          display: inline-block;
						          font-size: 14px;
						          font-weight: bold;
						          margin: 0;
						          padding: 12px 25px;
						          text-decoration: none;
						          text-transform: capitalize; }
						      .btn-primary table td {
						        background-color: #3498db; }
						      .btn-primary a {
						        background-color: #3498db;
						        border-color: #3498db;
						        color: #ffffff; }
						      .last {
						        margin-bottom: 0; }
						      .first {
						        margin-top: 0; }
						      .align-center {
						        text-align: center; }
						      .align-right {
						        text-align: right; }
						      .align-left {
						        text-align: left; }
						      .clear {
						        clear: both; }
						      .mt0 {
						        margin-top: 0; }
						      .mb0 {
						        margin-bottom: 0; }
						      .preheader {
						        color: transparent;
						        display: none;
						        height: 0;
						        max-height: 0;
						        max-width: 0;
						        opacity: 0;
						        overflow: hidden;
						        mso-hide: all;
						        visibility: hidden;
						        width: 0; }
						      .powered-by a {
						        text-decoration: none; }
						      hr {
						        border: 0;
						        border-bottom: 1px solid #f6f6f6;
						        Margin: 20px 0; }
						      @media only screen and (max-width: 620px) {
						        table[class=body] h1 {
						          font-size: 28px !important;
						          margin-bottom: 10px !important; }
						        table[class=body] p,
						        table[class=body] ul,
						        table[class=body] ol,
						        table[class=body] td,
						        table[class=body] span,
						        table[class=body] a {
						          font-size: 16px !important; }
						        table[class=body] .wrapper,
						        table[class=body] .article {
						          padding: 10px !important; }
						        table[class=body] .content {
						          padding: 0 !important; }
						        table[class=body] .container {
						          padding: 0 !important;
						          width: 100% !important; }
						        table[class=body] .main {
						          border-left-width: 0 !important;
						          border-radius: 0 !important;
						          border-right-width: 0 !important; }
						        table[class=body] .btn table {
						          width: 100% !important; }
						        table[class=body] .btn a {
						          width: 100% !important; }
						        table[class=body] .img-responsive {
						          height: auto !important;
						          max-width: 100% !important;
						          width: auto !important; }}
						      @media all {
						        .ExternalClass {
						          width: 100%; }
						        .ExternalClass,
						        .ExternalClass p,
						        .ExternalClass span,
						        .ExternalClass font,
						        .ExternalClass td,
						        .ExternalClass div {
						          line-height: 100%; }
						        .apple-link a {
						          color: inherit !important;
						          font-family: inherit !important;
						          font-size: inherit !important;
						          font-weight: inherit !important;
						          line-height: inherit !important;
						          text-decoration: none !important; } 
						        .btn-primary table td:hover {
						          background-color: #34495e !important; }
						        .btn-primary a:hover {
						          background-color: #34495e !important;
						          border-color: #34495e !important; } }
						    </style>
						  </head>
						  <body>
						    <table border="0" cellpadding="0" cellspacing="0" class="body" style="background-color:#f5f5f5;">
						      <tr>
						        <td>&nbsp;</td>
						        <td class="container">
						          <div class="content">

						            <!-- START CENTERED WHITE CONTAINER -->
						            <table class="main">
						              <!-- START MAIN CONTENT AREA -->
						              <tr>
						                <td class="wrapper">
						                  <table border="0" cellpadding="0" cellspacing="0" style="max-width:580px;">
						                    <tr>
						                      <td>
						                        <p>Please confirm with this code `+ visitor.confirm_code + `</p>
						                        <p>Terms and Conditions:</p>
						                        <p>By confirming this code you are accepting the terms and conditions of O&P Tree Interactive Mobile Application (OPTIMA).</p>
						                        <p>To the best of our ability, OPTIMA has worked to ensure accurate representation of all the codes listed within OPTIMA.  OPTIMA is not liable for any codes or descriptions that are found to be inaccurate or misleading.  Billing and coding is ultimately the responsibility of the user and OPTIMA is merely a tool to assist with that function. </p>
						                        <p>Advertisers are in no way endorsed by OPTIMA and hold no individual interest in members of the OPTIMA Team.  Products represented within the app are the suggested code from the company, but again, is solely up to the medical professional to ensure the proper code(s) is being used.</p>
						                        <p>OPTIMA is not responsible for glitches or bugs that may occur while operating the app and will work to correct any mistakes in a timely manner.  When available, it is highly recommended that you update OPTIMA to the latest version for the most accurate codes, descriptions, and user interfaces.</p>
						                        <p>OPTIMA does not condone users sharing their login information and reserves the right to block users who violate this policy.  Users are, however, encouraged to use OPTIMA on multiple devices. Each user should have a separate login.</p>
						                        <p>OPTIMA reserves the right to alter its advertisements, cost structure and other user interfaces as it sees fit.  </p>
						                        <p>OPTIMA strives to keep up-to-date with the latest code changes but does not guarantee that this will take place immediately when the new codes take effect.</p>
						                        <p>The OPTIMA Team thanks you for downloading our application and hopes you will provide us with a positive rating and constructive feedback to help us improve our app.</p>
						                        <p>Thank you,</p>
						                      </td>
						                    </tr>
						                  </table>
						                </td>
						              </tr>
						              <!-- END MAIN CONTENT AREA -->
						              </table>
						            <!-- START FOOTER -->
						            <div class="footer">
						              <table border="0" cellpadding="0" cellspacing="0">
						                <!-- <tr>
						                  <td class="content-block">
						                    <span class="apple-link">Company Inc, 3 Abbey Road, San Francisco CA 94102</span>
						                    <br> Don't like these emails? <a href="http://i.imgur.com/CScmqnj.gif">Unsubscribe</a>.
						                  </td>
						                </tr> -->
						                <tr>
						                  <td class="content-block powered-by" style="color:#232323;font-size:14px;">
						                    OPTIMA  Team
						                  </td>
						                </tr>
						              </table>
						            </div>
						            <!-- END FOOTER -->
						            
						          <!-- END CENTERED WHITE CONTAINER -->
						          </div>
						        </td>
						        <td>&nbsp;</td>
						      </tr>
						    </table>
						  </body>
						</html>`
				}
				mailgun.messages().send(data, function (err, eresult) {
					if (err) {
						console.log(err);
						res.json({ success: false });
					}
					else {
						console.log("email sent");
						banners = [];
						splashs = [];
						isFirstB = true;
						isFirstS = true;
						var banner = [];
						var splash = [];
						if (product) {
							banner = getBanner(product.data);
							splash = getSplash(product.data);
						}

						var token = jwt.sign({ email: visitor.email }, secret, { expiresIn: '1h' });
						res.json({ success: true, confirm_code: visitor.confirm_code, _id: visitor._id, banner: banner, splash: splash, message: 'successfully registered', token: token });
					}
				});
			})
		});
	});

	router.post('/confirm', function (req, res) {
		console.log(req.body);
		Visitor.findOne({ email: req.body.email }, function (err, result) {
			console.log(result.confirm_code);
			if (result.confirm_code == req.body.confirm_code) {
				result.password = req.body.password;
				result.confirm_code = "accept";
				result.save(function (err) {
					console.log(err);
					if (err) {
						res.json({ success: false });
					} else {
						res.json({ success: true });
					}
				});
			} else {
				res.json({ success: false });
			}
		});
	});

	router.post('/forgot_password', function (req, res) {
		Visitor.findOne({ email: req.body.email }, function (err, result) {
			if (err || result == null) {
				res.json({ success: false, message: 'User does not exist' });
			} else {
				var password = Math.floor(100000 + Math.random() * 900000).toString().substring(0, 4);
				result.password = password;
				result.save(function (err) {
					if (err) {
						res.json({ success: false, message: "Try again later." });
						return;
					}
					var domain_url = '';
					var api_key = '';
					var from_who = "";
					var mailgun = new Mailgun({ apiKey: api_key, domain: domain_url });
					var data = {
						from: from_who,
						to: req.body.email,
						subject: 'Forget password',
						html: '<h1>Changed password</h1><h4>please use this password ' + password + '</h4>'
					}
					mailgun.messages().send(data, function (err, eresult) {
						console.log(err, eresult);
						if (err) {
							res.json({ success: false, message: "Try again later" });
						}
						else {
							res.json({ success: true });
						}
					});
				})
			}
		});
	});

	router.post('/login', function (req, res) {
		Visitor.findOne({ email: req.body.email }).select('email password').exec(function (err, result) {
			Product.findOne({}).exec(function (err, product) {
				if (err) throw err; // Throw err if cannot connect
				console.log(result);
				// Check if user is found in the database (based on username)           
				if (!result) {
					res.json({ success: false, message: 'User does not exist' }); // Username not found in database
				} else if (result) {
					// Check if user does exist, then compare password provided by user
					if (!req.body.password) {
						res.json({ success: false, message: 'No password provided' }); // Password was not provided
					} else {
						var validPassword = result.comparePassword(req.body.password); // Check if password matches password provided by user 
						if (!validPassword) {
							res.json({ success: false, message: 'Password does not matched' }); // Password does not match password in database
						} else {
							var token = jwt.sign({ email: result.email }, secret, { expiresIn: '1h' }); // Logged in: Give user token
							banners = [];
							splashs = [];
							isFirstB = true;
							isFirstS = true;
							var banner = [];
							var splash = [];
							if (product) {
								banner = getBanner(product.data);
								splash = getSplash(product.data);
							}
							res.json({ success: true, _id: result._id, banner: banner, splash: splash, message: 'User authenticated!', token: token }); // Return token in JSON object to controller
						}
					}
				}
			});
		});
	});

	router.get('/get_images', function (req, res) {
		Product.findOne({}).exec(function (err, product) {
			if (err) throw err;
			if (product) {
				banners = [];
				splashs = [];
				isFirstB = true;
				isFirstS = true;
				var banner = [];
				var splash = [];
				if (product) {
					banner = getBanner(product.data);
					splash = getSplash(product.data);
				}
				res.json({ success: true, banner: banner, splash: splash });
			}
		});
	});

	router.post('/get_favlist', function (req, res) {
		Visitor.findOne({ _id: req.body.userid }, function (err, result) {
			if (err) throw error;
			if (!result) {
				res.json({
					success: false,
					favlist: []
				})
			} else if (result) {
				res.json({
					success: true,
					favlist: result.favorite
				})
			}
		})
	});

	router.post('/del_favitem', function (req, res) {
		Visitor.findOne({ _id: req.body.userid }, function (err, result) {
			if (err) throw error;
			if (!result) {
				res.json({
					success: false,
				})
			} else if (result) {
				for (index in result.favorite) {
					if (result.favorite[index].cname == req.body.cname) {
						result.favorite.splice(index, 1);
						break;
					}
				}
				result.save(function (err) {
					if (err) throw err;
					res.json({
						success: true
					})
				})

			}
		});
	});
	router.post('/add_favitem', function (req, res) {
		Visitor.findOne({ _id: req.body.userid }, function (err, result) {
			if (err) throw error;
			if (!result) {
				res.json({
					success: false
				})
			} else if (result) {
				var fav = {};
				console.log(req.body.cname);
				fav.cname = req.body.cname;
				fav.description = req.body.description;
				fav.imgUrl = req.body.imgUrl;
				fav.listName = req.body.listName;
				result.favorite.push(fav);
				result.save(function (err) {
					if (err) throw err;
					res.json({
						success: true,
					})
				})

			}
		})
	})

	function DatawithoutAddon(Data) {
		console.log(Data[0]);
		for (var i in Data) {
			if (Data[i].roleName != null) {
				if (Data[i].roleName.indexOf("ADD-ON") > -1) {
					Data.splice(i, 1);
					continue;
				}
			}

			if (Data[i].children.length > 0) {
				DatawithoutAddon(Data[i].children);
			} else {
				console.log("code");
				continue;
			}
		}
		return Data;
	}

	function getCode(Data, codeName) {
		for (var i in Data) {
			if (Data[i].roleName == codeName) {
				code.codeName = Data[i].roleName;
				code.codeDescription = Data[i].description;
				code.details = Data[i].detail;
				if (!code.details) code.details = [];
				code.splashs = Data[i].splash;
				if (!code.splashs) code.splashs = [];
				code.banners = Data[i].banner;
				if (!code.banners) code.banners = [];
				break;
			} else if (Data[i].children.length > 0) {
				getCode(Data[i].children, codeName);
			}
		}
		return code;
	}

	function getCodePath(Data, codeName) {
		for (var i in Data) {
			if (Data[i].roleType == 'code') {
				if (Data[i].roleName == codeName) {
					code.codeName = Data[i].roleName;
					code.codeDescription = Data[i].description;
					code.details = Data[i].detail;
					if (!code.details) code.details = [];
					code.splashs = Data[i].splash;
					if (!code.splashs) code.splashs = [];
					code.banners = Data[i].banner;
					if (!code.banners) code.banners = [];
					completePath = codePath;

					return codePath;
					break;
				}
			} else if (Data[i].children.length > 0) {
				if (completePath.length == 0) {
					codePath.push(i);

				}

				getCodePath(Data[i].children, codeName);
			}
			if (completePath.length == 0 && i == Data.length - 1) {
				codePath.pop();

			}

		}
		return completePath;
	}
	function compareAddon(temp, index) {
		var resultArray = [];
		for (idx in temp) {
			var tempRoleName = temp[idx].roleName.toUpperCase();
			var targetRoleName = temp[index].roleName.toUpperCase();
			if (tempRoleName.indexOf("ADD-ON") > -1) {
				console.log(tempRoleName, "addon", targetRoleName);
				if (tempRoleName.indexOf(targetRoleName) > -1) {
					console.log("include category and addon");
					resultArray.push(temp[idx].children);
				}
			}
		}
		return resultArray;
	}
	var tempCodes = [];
	function getAddonCodeArray(cname, callback) {

		var addOncodes = [];
		tempCodes = [];
		Product.findOne({}).exec(function (err, product) {
			var path = getCodePath(product.data, cname);
			incrementCount(path, product, cname)
			var addOnCategory = [];
			var tempData = product.data;

			for (var i = 0; i < path.length; i++) {
				var searchedData = compareAddon(tempData, path[i]);
				if (searchedData) {
					// console.log(searchedData);
					for (index in searchedData) {
						var codes = getAllAdonCodes(searchedData[index]);

						for (idx in codes) {
							var isRepeat = 0;
							for (var k = 0; i < addOncodes.length; k++) {
								if (addOncodes[k] == undefined) break;
								if (addOncodes[k].roleName == codes[idx].roleName) {
									isRepeat = 1;
									break;
								}
							}
							if (isRepeat == 0) addOncodes.push(codes[idx]);
						}
					}
				}
				tempData = tempData[path[i]].children;
			}

			callback(addOncodes);
		});

	};
	function getAllAdonCodes(temp) {


		for (idx in temp) {
			if (temp[idx].roleType == "code") {
				var tcode = {};
				tcode.roleName = temp[idx].roleName;
				tcode.description = temp[idx].description;
				tempCodes.push(tcode);
			} else {
				if (temp[idx].children.length > 0) {
					getAllAdonCodes(temp[idx].children);
				}

			}
		}

		return tempCodes;
	}

	function incrementCount(path, product, cname) {
		if (path.length <= 0) return;
		// console.log(product[path[0]].children[2].children[1].children[0].count + 1);
		var str = 'product.data[' + path[0] + ']';
		for (var i = 1; i < path.length; i++) {
			str += ".children[" + path[i] + "]";
		}
		str += ".children";
		var lastData = eval(str);
		for (var i = 0; i < lastData.length; i++) {
			if (lastData[i].roleName === cname) {
				str += "[" + i + "]";
				break;
			}
		}
		str += ".count";
		if (eval(str)) {
			str += "+=1";
		} else {
			str += "=1";
		}
		console.log(str)
		eval(str);
		console.log(JSON.stringify(product));
		Product.update({ _id: product._id }, { data: product.data }, function (err, raw) {
			console.log(raw)
		});

	}

	function getAddon(Data, cname) {
		for (index in Data) {

			if (Data[index].roleName.toUpperCase().indexOf('ADD-ON') > -1) {

				if (Data[index].roleName.toUpperCase().indexOf(cname.toUpperCase()) > -1) {
					addonCat = Data[index];
				}
			} else if (Data[index].children.length > 0) {
				getAddon(Data[index].children, cname);
			}
		}
		return addonCat;
	}

	function getAddonCodes(Data) {
		for (index in Data) {
			if (Data[index].roleType == 'code') {
				var temp = {};
				temp.roleName = Data[index].roleName;
				temp.description = Data[index].description;
				aocodes.push(temp);
			} else if (Data[index].children.length > 0) {
				getAddonCodes(Data[index].children);
			}
		}
		return aocodes;
	}

	function getBanner(Data) {
		for (var index in Data) {
			if (Data[index].roleType == 'code') {

				if (Data[index].banner) {
					for (id in Data[index].banner) {
						banners.push(Data[index].banner[id]);
					}

				}
			} else {
				getBanner(Data[index].children)
			}
		}
		if (isFirstB == true) {
			var tempObj = {};
			tempObj.imageUrl = "http://54.201.6.118:3000/uploads/file-defaultbb.png";
			tempObj.siteUrl = "www.oandptree.com";
			banners.unshift(tempObj);
			isFirstB = false;
		}
		return banners;
	}
	function getSplash(Data) {
		for (var index in Data) {
			if (Data[index].roleType == 'code') {
				if (Data[index].splash) {
					for (id in Data[index].splash)
						splashs.push(Data[index].splash[id]);
				}
			} else {
				getSplash(Data[index].children)
			}
		}
		if (isFirstS == true) {
			var tempObj = {};
			tempObj.imageUrl = "http://54.201.6.118:3000/uploads/file-defaultss.png";
			tempObj.siteUrl = "www.oandptree.com";
			splashs.unshift(tempObj);
			isFirstS = false;
		}
		return splashs;
	}
	function getCodes(Data) {
		for (var i in Data) {

			if (Data[i].roleType == 'code') {
				var codeTemp = {};
				codeTemp.codeName = Data[i].roleName;
				codeTemp.codeDescription = Data[i].description;
				if (!codeTemp.codeDescription) {
					codeTemp.codeDescription = "codeDescription";
				}
				var detail = Data[i].detail;
				if (detail) {
					codeTemp.detailImg = Data[i].detail[0].imageUrl;
				} else {
					codeTemp.detailImg = "";
				}
				var isRepeat = 0
				for (var k = 0; k < codeDes.length; k++) {
					if (codeDes[k].codeName == codeTemp.codeName) {
						isRepeat = 1;
						break;
					}
				}
				if (isRepeat == 0) {
					codeDes.push(codeTemp);
				}




			} else if (Data[i].children.length > 0) {
				// if (Data[i].roleName.toUpperCase().indexOf('ADD-ON')>-1){
				// 	console.log(Data[i].roleName);
				// 	continue;
				// }else{
				getCodes(Data[i].children);
				// }
			}
		}
		return codeDes;
	}
	// Middleware for Routes that checks for token - Place all routes after this route that require the user to already be logged in
	router.use(function (req, res, next) {
		var token = req.body.token || req.body.query || req.headers['x-access-token']; // Check for token in body, URL, or headers

		// Check if token is valid and not expired  
		if (token) {
			// Function to verify token
			jwt.verify(token, secret, function (err, decoded) {
				if (err) {
					res.json({ success: false, message: 'Token invalid' }); // Token has expired or is invalid
				} else {
					req.decoded = decoded; // Assign to req. variable to be able to use it in next() route ('/me' route)
					next(); // Required to leave middleware
				}
			});
		} else {
			res.json({ success: false, message: 'No token provided' }); // Return error if no token was provided in the request
		}
	});

	router.get('/permission', function (req, res) {
		User.findOne({ username: req.decoded.username }, function (err, user) {
			if (err) throw err; // Throw error if cannot connect
			// Check if username was found in database
			if (!user) {
				res.json({ success: false, message: 'No user was found' }); // Return an error
			} else {
				res.json({ success: true, permission: user.permission }); // Return the user's permission
			}
		});
	});

	router.post('/addNew', function (req, res) {
		console.log(req.body);
		Product.findOne({}).exec(function (err, result) {
			console.log("__________________add code start__________________");
			data = AddNewCode(result.data, req.body, 0);
			result.data = [];
			result.data = data;
			result.save(function (err) {
				if (err) {
					res.json({ success: false });
				} else {
					res.json({ success: true, data: data });
				}
			})
		});
	});

	function AddNewCode(data, addData, idx) {
		for (index in data) {
			console.log()
			if (data[index].roleName == addData.path[idx]) {
				console.log("find~~~~~~~~~~");
				if (addData.path.length > idx + 1) {
					idx++;
					AddNewCode(data[index].children, addData, idx);
				} else {
					console.log("create directory and code");
					var dir = {};
					var code = {};
					if (addData.data.directory) {

						dir.roleName = addData.data.directory;
						dir.roleType = 'parent';
						dir.children = [];
					}
					if (addData.data.code) {

						code.children = [];
						code.roleName = addData.data.code;
						code.roleType = 'code';
						code.description = addData.data.description;
						if (addData.data.directory) {
							dir.children.push(code);
						}
					}
					if (addData.data.directory) {
						data[index].children.push(dir);
					} else {
						data[index].children.push(code);
					}
				}
			}
		}
		return data;
	}

	router.post('/deleteDirectory', function (req, res) {
		console.log(req.body);
		Product.findOne({}).exec(function (err, result) {
			console.log("__________________del directory start__________________");
			data = deleteDirectory(result.data, req.body, 0);


			result.data = [];
			result.data = data;
			result.save(function (err) {
				if (err) {
					res.json({ success: false });
				} else {
					res.json({ success: true, data: data });
				}
			})
		});
	});

	function deleteDirectory(data, addData, idx) {
		for (index in data) {
			console.log()
			if (data[index].roleName == addData.path[idx]) {
				console.log("find~~~~~~~~~~");
				if (addData.path.length > idx + 2) {
					idx++;
					deleteDirectory(data[index].children, addData, idx);
				} else {
					console.log("delete directory");
					var children = data[index].children;
					var delIdx = -1;
					for (var i = 0; i < children.length; i++) {
						if (children[i].roleName == addData.path[idx + 1]) {
							delIdx = i;
						}
					}
					data[index].children.splice(delIdx, 1);
				}
			}
		}
		return data;
	}

	router.post('/updateCodeName', function (req, res) {
		console.log(req.body);
		Product.findOne({}).exec(function (err, result) {
			console.log("__________________del directory start__________________");
			data = updateCodeName(result.data, req.body);
			result.data = [];
			result.data = data;
			result.save(function (err) {
				if (err) {
					res.json({ success: false });
				} else {
					res.json({ success: true, data: data });
				}
			})
		});
	});

	function updateCodeName(data, updateData) {
		for (index in data) {
			if (data[index].roleName == updateData.currentCodeName && data[index].roleType == 'code') {
				data[index].roleName = updateData.updatedCodeName;
			} else if (data[index].children.length > 0) {
				updateCodeName(data[index].children, updateData);
			}
		}
		return data;
	}

	router.post('/updateDescription', function (req, res) {
		console.log(req.body);
		Product.findOne({}).exec(function (err, result) {
			console.log("__________________del directory start__________________");
			data = updateDescription(result.data, req.body);
			result.data = [];
			result.data = data;
			result.save(function (err) {
				if (err) {
					res.json({ success: false });
				} else {
					res.json({ success: true, data: data });
				}
			})
		});
	})

	function updateDescription(data, updateData) {
		for (index in data) {
			if (data[index].roleName == updateData.currentCodeName && data[index].roleType == 'code') {
				data[index].description = updateData.description;
			} else if (data[index].children.length > 0) {
				updateDescription(data[index].children, updateData);
			}
		}
		return data;
	}

	router.post('/allow', function (req, res) {
		console.log(req.body);
		Product.findOne({}).exec(function (err, result) {
			console.log("__________________allow start__________________");
			data = allow(result.data, req.body);
			result.data = [];
			result.data = data;
			result.save(function (err) {
				if (err) {
					res.json({ success: false });
				} else {
					res.json({ success: true, data: data });
				}
			})
		});
	});
	function allow(data, allowData) {
		for (index in data) {
			if (data[index].roleName == allowData.currentCodeName && data[index].roleType == 'code') {
				if (allowData.which == 0) {
					console.log("_________________detail___________________");
					data[index].detail[allowData.index].active = true;
				} else if (which == 1) {
					console.log("_________________splash___________________");
					data[index].splash[allowData.index].active = true;
				} else if (which == 2) {
					console.log("_________________banner___________________");
					data[index].banner[allowData.index].active = true;
				}
			} else if (data[index].children.length > 0) {
				allow(data[index].children, allowData);
			}
		}
		return data;
	}

	router.post('/reject', function (req, res) {
		console.log(req.body);
		Product.findOne({}).exec(function (err, result) {
			console.log("__________________reject start__________________");
			data = reject(result.data, req.body);
			result.data = [];
			result.data = data;
			result.save(function (err) {
				if (err) {
					res.json({ success: false });
				} else {
					res.json({ success: true, data: data });
				}
			})
		});
	});

	function reject(data, rejectData) {
		for (index in data) {
			if (data[index].roleName == rejectData.currentCodeName && data[index].roleType == 'code') {
				console.log("found codeName");
				if (rejectData.which == 0) {
					console.log("_________________detail___________________");
					data[index].detail[rejectData.index].active = false;
					console.log(data[index].detail[rejectData.index]);
				} else if (which == 1) {
					console.log("_________________splash___________________");
					data[index].splash[rejectData.index].active = false;
				} else if (which == 2) {
					console.log("_________________banner___________________");
					data[index].banner[rejectData.index].active = false;
				}
			} else if (data[index].children.length > 0) {
				reject(data[index].children, rejectData);
			}
		}
		return data;
	}



	return router; // Return the router object to server

};





