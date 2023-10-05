const express = require('express');
const mysql = require('mysql')
const cors = require('cors')
const app = express();
const fs = require('fs');
const bodyparser = require("body-parser")



const fileupload = require("express-fileupload")

const path = require('path')
const { error, log } = require('console');
const { stringify } = require('querystring');




app.use(cors());
app.use(bodyparser.json())
app.use(bodyparser.urlencoded({ extended: false }))
app.use(fileupload())
// app.use("/images", express.static('images'))
app.use("/upload", express.static('upload'))





const c = mysql.createConnection({
    host: "localhost",
    port: "3306",
    user: "root",
    database: "nuzze",
    password: "Boop@thi@2003"
})


c.connect(function (error) {
    if (error) {
        console.log("error")
    } else {
        console.log("port is running 3005")
    }
})

app.listen(3005)


// ================================================================================register

app.post('/usertable', (req, res) => {
    const passworddcrypt = req.body.password;
    console.log(passworddcrypt)
    const password = btoa(passworddcrypt)
    console.log(password)
    const name = req.body.name;
    const phone_number = req.body.phone_number;
    const email = req.body.email;
    const currentdate = new Date();

    const signin = "select * from usertable where email = ? ";
    c.query(signin, [email], (err, result) => {
        console.log('result',result)
        console.log(result.length);
        if (err) {
            let sts = {
                "status": "error",
            }
            res.send(sts);
        } else if (result.length == 0) {
            const sql = 'insert into usertable(name,phone_number,email,password,created_on)values(?,?,?,?,?)'
            c.query(sql, [name, phone_number, email, password, currentdate], (error, result) => {
                console.log(result);
                if (error) {
                    var sts = {
                        "status": "error",
                    }
                    res.send(sts);
                   
                   
                }else{
                    const sql = 'select * from usertable where email =?'
                    c.query(sql,[email],(error,result)=>{
                        console.log(result.length);
                        if(error){
                            var sts = {
                                "status": "error",
                            }
                            res.send(sts);

                        }else{
                            console.log('register');
                            var sts = {
                                "status": "successfully",
                                detail :result
    
                            }
                            res.send(sts);

                        }
                    })
                }
            })

            } else {
                
            let email1 = result[0].email;
            console.log(email1)

            if (email1 == email ) {
                let sts = {
                    "status": "email already exist",
                    details: result

                }

                res.send(sts);
                
        
            }


        }
    })


})


// =========================================signin=============================================


app.post("/signin", (req, res) => {
    let email = req.body.email;
    let password = req.body.password;

    const signin = "select * from usertable where email = ? ";
    c.query(signin, [email], (err, result) => {
        console.log(result)

        if (err) {
            let sts = {
                "status": "no email id",
            }
            res.send(sts);
        }
        else if (result.length > 0) {
            let email1 = result[0].email;
            console.log(email1)
            let pass = result[0].password;
            console.log(pass)
            let password1 = atob(pass)
            console.log(password1)




            if (email1 == email && password1 == password) {
                let sts = {
                    "status": "success",
                    details: result

                }

                res.send(sts);



            }
            

        }else{
            let sts = {
                "status": "no records",
               

            }

            res.send(sts);

        }
    })
})

// A========================================user detials get===================================

app.get('/getuserdata', (req, res) => {
    const id = req.query.id;
    const phone_number = req.query.phone_number;
    const role_id = req.query.role_id;
    const fromdate = req.query.fromdate;
    const todate = req.query.todate;
    const date = req.query.date;

    if (!id && !phone_number && !role_id && !fromdate && !todate && !date) {
        const sql = 'select * from usertable'
        c.query(sql, (error, result) => {
            if (error) {
                var details = {
                    "status": "Not able to view"
                }
                res.send(details);
            }
            else {

                res.send(result);
            }
        })
    }
    else {
        const sql = 'SELECT * FROM usertable WHERE id = ? OR phone_number = ? OR role_id = ? OR created_on BETWEEN  ? AND ?  OR  date(created_on)=?';
        console.log(todate)
        console.log(date)
        c.query(sql, [id, phone_number, role_id, fromdate, todate, date], (error, result) => {
            console.log(result)
            if (error) {
                var details = {
                    "status": "Not able to view"
                }
                res.send(details);
            }
            else {

                res.send(result);
            }
        })

    }
})

// A=====================================================user detials deactivate==================
app.put('/deactivate/:id', (req, res) => {
    const id = req.params.id;
    console.log(id);
    const sql = 'UPDATE usertable SET status = 0 WHERE id = ?';
    c.query(sql, [id], (error, result) => {
        if (error) {
            console.error('Error deactivating user by id:', error)
            const response = {
                response: {
                    msg: '0',
                    error: 'Internal server error',
                },
            };
            res.send(response);
        } else {
            if (result.affectedRows === 0) {

                const response = {
                    response: {
                        msg: '0',
                        result: 'User not found',
                    },
                };
                res.send(response);

            } else {

                const response = {
                    response: {
                        msg: '1',
                        result: 'User deactivated',
                    },
                };
                res.send(response);
            }
        }
    });
});
// ========================================================contact us dataget===================

app.post('/contactusdata', (req, res) => {
    const email = req.body.email;
    console.log(email);
    const name = req.body.name;
    const subject = req.body.subject;
    const query = req.body.query;
    const date1 = new Date();


    const sql1 = 'SELECT id FROM usertable WHERE email = ?';
    c.query(sql1, [email], (error, result) => {
        console.log(result);
        if (error) {

            res.status(error)
        } else {

            if (result.length === 0) {
                var details = { "status": "register first" }
                res.send(details);
            } else {
                const user_id = result[0].id;
                const sql = 'INSERT INTO contactus (user_id, email, name, subject, query, created_on) VALUES (?, ?, ?, ?, ?, ?)';
                c.query(sql, [user_id, email, name, subject, query, date1], (error, result) => {
                    if (error) {

                        res.status(500).json({ error: "Internal Server Error" });
                    } else {

                        var details = { "status": "data collected successfully" }
                        res.send(details);
                    }
                });
            }
        }
    });
});

// A====================================================contact us delete=====================
app.delete('/contactusdel', (req, res) => {
    const id = req.body.id;
    const sql = "delete from contactus where id=?"
    c.query(sql, [id], (error, result) => {
        if (error) {
            var details = {
                "status": "Not able to delete "
            }
            res.send(details);
        }
        else {
            var details = {
                "status": "Data deleted successfully"
            }
            res.send(details);
        }
    })
})

// A========================================contact us get======================================
app.get('/contactusget', (req, res) => {
    const sql = 'select * from contactus'
    c.query(sql, (error, result) => {
        if (error) {
            var details = {
                "status": "Not able to view"
            }
            res.send(details);
        }
        else {

            res.send(result);
        }
    })
})




// // A=========================================product insert========================================

// app.post('/prodinsert', (req, res) => {
//     const team_id = req.body.team_id;
//     const category = req.body.category;
//     const sub_category = req.body.sub_category;
//     const description = req.body.description;
//     const date2 = new Date();

//     if (!req.files || !req.files.image) {
//         return res.status(400).json({
//             msg: 'Please upload an image',
//         });
//     }

//     const image = req.files.image;

//     const allowedFormats = ['.jpg', '.jpeg', '.png'];
//     const fileExtension = path.extname(image.name).toLowerCase();

//     if (!allowedFormats.includes(fileExtension)) {
//         return res.status(400).json({
//             msg: 'Only jpg, jpeg, and png formats are allowed',
//         });
//     }

//     const maxSize = 10 * 1000 * 1000; 
//     if (image.size > maxSize) {
//         return res.status(400).json({
//             msg: 'Image size exceeds the maximum allowed (10MB)',
//         });
//     }

//     const uniqueFilename = Date.now() + "-" + fileExtension;
//     const imagePath = path.join(__dirname, "images", uniqueFilename);
//     console.log(imagePath)


//     image.mv(imagePath, (err) => {
//         if (err) {
//             return res.status(500).json({
//                 msg: 'Error uploading file',
//             });
//         }

//         const imageUrl = `/images/${uniqueFilename}`;

//         const sql = 'INSERT INTO product (team_id, category, sub_category, image, description, created_on) VALUES (?, ?, ?, ?, ?, ?)';
//         c.query(sql, [team_id, category, sub_category, imageUrl, description, date2], (error, result) => {
//             if (error) {
//                 return res.status(500).json({
//                     msg: 'Error inserting data into the database',
//                 });
//             } else {
//                 const sql = "select * from product where id =?";
//                 c.query(sql, [result.insertId], (error, result) => {
//                     if (error) {
//                         return res.status(200).json({
//                             status: error

//                         });
//                     } else {

//                         return res.status(200).json({
//                             status: 'Data Collected Successfully',
//                             imageurl: `http://localhost:3005${result[0].image}`,
//                             details: result

//                         })

//                     }
//                 })

//             }
//         });
//     });
// });



// =================================product get===================================================

app.get('/prodget', (req, res) => {
    const sql = 'select * from product'
    c.query(sql, (error, result) => {
        if (error) {
            var details = {
                "status": "Not able to view"
            }
            res.send(details);
        }
        else {
            res.send(result);
        }
    })
})


// ============================================================product del================================
app.delete('/proddel', (req, res) => {
    const id = req.query.id;
    const sql = "delete from product where id=?"
    c.query(sql, [id], (error, result) => {

        //console.log(result);
        if (error) {
            var details = {
                "status": "Not able to delete "
            }
            res.send(details);
        }
        else {
            var details = {
                "status": "Data deleted successfully"
            }
            res.send(details);
        }
    })
})


// ======================================================product update=====================================


// app.post('/productUpdate', (req, res) => {
//     const idupdate = req.body.id;
//     const sql1 = 'SELECT * FROM product WHERE id = ?';

//     c.query(sql1, [idupdate], (error, results) => {
//         if (error) {
//             const response = {
//                 response: {
//                     msg: '0',
//                     result: 'No Records!',
//                 },
//             };
//             res.send(response);
//         }

//         // if (results.length === 0) {
//         //     res.send(results);
//         // }

//         const oldData = results[0];

//         const {
//             team_id = oldData.team_id,
//             category = oldData.category,
//             sub_category = oldData.sub_category,
//             description = oldData.description,
//         } = req.body;

//         let imageUrl = oldData.image;

//         if (req.files && req.files.image) {

//             const fileimage = req.files.image;
//             const allowedFormats = ['jpg', 'jpeg', 'png'];
//             const maxFileSize = 10 * 1000 * 1000;

//             if (
//                 fileimage.size <= maxFileSize &&
//                 allowedFormats.includes(fileimage.name.split('.').pop().toLowerCase())
//             ) {
//                 const uniqueFilename =
//                     Date.now() + '-' + path.extname(fileimage.name);

//                 fileimage.mv(path.join(__dirname, 'images', uniqueFilename), (err) => {
//                     if (err) {
//                         const response = {
//                             response: {
//                                 msg: '0',
//                                 result: 'Error uploading file',
//                             },
//                         };
//                         res.send(response);

//                     }
//                     imageUrl = `/images/${uniqueFilename}`;

//                     const updateQuery = `
//                     UPDATE product
//                     SET team_id=?, category=?, sub_category=?, description=?, image=?
//                     WHERE id=?
//                 `;

//                     c.query(
//                         updateQuery,
//                         [team_id, category, sub_category, description, imageUrl, idupdate],
//                         (error, result) => {
//                             if (error) {
//                                 console.error(error);
//                                 let s = { status: 'error' };
//                                 res.send(s);
//                             } else {
//                                 const response = {
//                                     response: {
//                                         message: '1',
//                                         result: 'successfully updated',
//                                     },
//                                 };
//                                 res.send(response);
//                             }
//                             console.log('Old data:', oldData);
//                         }
//                     );
//                 });
//             } else {

//                 const response = {
//                     response: {
//                         message: '0',
//                         result: 'Image format not allowed or file size exceeds 10MB',
//                     },
//                 };
//                 res.send(response);

//             }
//         } else {

//             const updateQuery = `
//                 UPDATE product
//                 SET team_id=?, category=?, sub_category=?, description=?
//                 WHERE id=?
//             `;


//             c.query(
//                 updateQuery,
//                 [team_id, category, sub_category, description, idupdate],
//                 (error, result) => {
//                     if (error) {
//                         console.error(error);
//                         let s = { status: 'error' };
//                         res.send(s);
//                     } else {
//                         const response = {
//                             response: {
//                                 message: '1',
//                                 result: 'successfully updated',
//                             },
//                         };
//                         res.send(response);
//                     }
//                     console.log('Old data:', oldData);
//                 }
//             );
//         }
//     });
// });
app.post('/Update', (req, res) => {
    const idupdate = req.body.id;
    const sql1 = 'SELECT * FROM product WHERE id = ?';

    c.query(sql1, [idupdate], (error, results) => {
        if (error) {
            const response = {
                response: {
                    msg: '0',
                    result: 'No Records!',
                },
            };
            res.send(response);
        }

        if (results.length === 0) {
            res.send(results);
        }

        const oldData = results[0];

        const {
            team_id = oldData.team_id,
            category = oldData.category,
            sub_category = oldData.sub_category,
            description = oldData.description,
        } = req.body;

        let imageUrl = oldData.image;

        if (req.files && req.files.image) {

            const fileimage = req.files.image;
            const allowedFormats = ['jpg', 'jpeg', 'png'];
            const maxFileSize = 10 * 1000 * 1000;

            if (
                fileimage.size <= maxFileSize &&
                allowedFormats.includes(fileimage.name.split('.').pop().toLowerCase())
            ) {
                const uniqueFilename =
                    Date.now() + '-' + path.extname(fileimage.name);

                fileimage.mv(path.join(__dirname, 'images', uniqueFilename), (err) => {
                    if (err) {
                        const response = {
                            response: {
                                msg: '0',
                                result: 'Error uploading file',
                            },
                        };
                        res.send(response);

                    }
                    imageUrl = `/images/${uniqueFilename}`;

                    const updateQuery = `
                    UPDATE product
                    SET team_id=?, category=?, sub_category=?, description=?, image=?
                    WHERE id=?
                `;

                    c.query(
                        updateQuery,
                        [team_id, category, sub_category, description, imageUrl, idupdate],
                        (error, result) => {
                            console.log(error)
                            if (error) {
                                console.error(error);
                                let s = { status: 'error' };
                                res.send(s);
                            } else {
                                const response = {
                                    response: {
                                        message: '1',
                                        result: 'successfully updated',
                                    },
                                };
                                res.send(response);
                            }
                            console.log('Old data:', oldData);
                        }
                    );
                });
            } else {

                const response = {
                    response: {
                        message: '0',
                        result: 'Image format not allowed or file size exceeds 10MB',
                    },
                };
                res.send(response);

            }
        } else {

            const updateQuery = `
                UPDATE product
                SET team_id=?, category=?, sub_category=?, description=?
                WHERE id=?
            `;

            c.query(
                updateQuery,
                [team_id, category, sub_category, description, idupdate],
                (error, result) => {
                    console.log(error)
                    if (error) {
                        console.error(error);
                        let s = { status: 'error' };
                        res.send(s);
                    } else {
                        const response = {
                            response: {
                                message: '1',
                                result: 'successfully updated',
                            },
                        };
                        res.send(response);
                    }
                    console.log('Old data:', oldData);
                }
            );
        }
    });
});


// ===============================================================project  insert==================================    



app.post('/project', async (req, res) => {

    async function getProductInfo(productid) {
        return new Promise((resolve, reject) => {
            const sql = 'SELECT * FROM product WHERE id = ?';
            c.query(sql, [productid], (error, result) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(result.length ? result[0] : null);
                }
            });
        });

    }
    try {

        const { productidget1, productidget2, productidget3, productidget4, eventdate, estimated_value, payment_status, eventname, orderdate, amount_paid, description } = req.body;
        const email = req.body.useremail;

        const products = await Promise.all([
            getProductInfo(productidget1),
            getProductInfo(productidget2),
            getProductInfo(productidget3),
            getProductInfo(productidget4),
        ]);


        // const prod_ids = products.filter(product => product && product.id !== 0).map(product => product.id);
        // const team_ids = products.filter(product => product && product.id !== 0).map(product => product.team_id);
        // const images = products.filter(product => product && product.id !== 0).map(product => product.image);
        const prod_ids = products.map(product => product ? product.id : 0);
        const team_ids = products.map(product => product ? product.team_id : 0);
        const images = products.map(product => product ? product.image : 0);



        const date2 = new Date();

        const sql1 = 'SELECT * FROM usertable WHERE email = ?';
        c.query(sql1, [email], async (error, result) => {
            if (error) {
                res.status(500).json({ error: 'Internal Server Error' });
            } else {
                if (result.length === 0) {
                    res.status(404).json({ status: 'User not found. Please register first.' });
                } else {
                    const user_id = result[0].id;
                    const prodid = JSON.stringify(prod_ids);
                    console.log(prodid)
                    const teamid = JSON.stringify(team_ids);
                    const imagesJSON = JSON.stringify(images);

                    const sql = 'INSERT INTO project (user_id, prod_id, team_id, description, eventdate, estimated_value, payment_status, image, eventname, orderdate, amount_paid, created_on) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';

                    c.query(
                        sql,
                        [user_id, prodid, teamid, description, eventdate, estimated_value, payment_status, imagesJSON, eventname, orderdate, amount_paid, date2,],
                        (error, result) => {
                            if (error) {
                                res.status(500).json({ error: 'Internal Server Error' });
                            } else {

                                res.status(200).json({ status: 'Data collected successfully' });
                            }
                        }
                    );
                }
            }
        });
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


// ===========================================================project add to cart=============================


app.post('/cartUpdate', (req, res) => {
    const id = req.body.id;

    console.log('id',id)

    const sql = 'select * from project where user_id=?'
    c.query(sql, [id], (error, result) => {
       
        console.log(result)
        console.log(result.length );
        if (error) {
            const response = {
                response: {
                    msg: '0',
                    result: 'error',
                },
            };
            res.send(response);

        } else {
            if (result.length===0) {
                const s={
                    "status":"no records"
                }
                res.send(s)
                
            }else if(result[0].status !=0){
                const s={
                    "status":"onprocessing"
                }
                res.send(s)
                console.log('onprocessing')
              
                
            }
            
            else{

            
            const prod_id_array = result[0].prod_id;
            
            const oldData = JSON.parse(prod_id_array);
            console.log('oldData', oldData)

            const {
                productidget1 = oldData[0],
                productidget2 = oldData[1],
                productidget3 = oldData[2],
                productidget4 = oldData[3],
            } = req.body;
            console.log(productidget1)
            console.log(productidget2)
            console.log(productidget3)
            console.log(productidget4)




            function getProductInfo(productid) {

                return new Promise((resolve, reject) => {
                    const sql = 'SELECT * FROM product WHERE id = ?';
                    c.query(sql, [productid], (error, result) => {
                        if (error) {
                            reject(error);
                        } else {
                            resolve(result.length ? result[0] : 0);
                        }
                    });
                });
            }

            const products = Promise.all([
                getProductInfo(productidget1),
                getProductInfo(productidget2),
                getProductInfo(productidget3),
                getProductInfo(productidget4),
            ]);

            products


                .then((productArray) => {


                    // const prod_ids = productArray.filter(product => product && product.id !== 0).map(product => product.id);
                    // const team_ids = productArray.filter(product => product && product.id !== 0).map(product => product.team_id);
                    // const images = productArray.filter(product => product && product.id !== 0).map(product => product.image);
                    const prod_ids = productArray.map(product => product ? product.id : 0);

                    const team_ids = productArray.map(product => product ? product.team_id : 0);
                    const images = productArray.map(product => product ? product.image : 0);
                    const prodname = productArray.map(product => product ? product.sub_category : 0);

                    console.log('afteradd', prod_ids)
                    const prodid = JSON.stringify(prod_ids);
                    //console.log(prodid)
                    const teamid = JSON.stringify(team_ids);
                    const imagesJSON = JSON.stringify(images);
                    const prod_name = JSON.stringify(prodname);

                    const sql3 =
                        "UPDATE project SET prod_id = ?, team_id = ?, image = ? , prod_name = ? WHERE user_id = ?";
                    c.query(
                        sql3,
                        [prodid, teamid, imagesJSON, prod_name, id],
                        (error, updateResult) => {
                            if (error) {
                                const response = {
                                    response: {
                                        msg: "0",
                                        result: "No Records!",
                                    },
                                };
                                res.send(response);
                            } else {
                                const response = {
                                    response: {
                                        msg: "1",
                                        details: result
                                    },
                                };

                                res.send(response);
                            }
                        }
                    );




                })
                .catch((error) => {
                    console.error(error);
                });


        }
    }
    })

})





// =========================================cart remove=================================================================


app.post('/cartremove/:productId/:id', (req, res) => {
    const id = req.params.id;

    const removepid = req.params.productId;
    console.log('reid', id)
    console.log('removeid', removepid)

    const sql = 'select * from project where user_id = ?'
    c.query(sql, [id], (error, result) => {
        if (error) {
            var details = {
                'status': 'error'
            }
            res.send(details)
        } else if(result[0].status !==''){
            var details = {
                'status': 'onprocess'
            }
            res.send(details)
            console.log(details);

        }
        else {
            const prod_id_array = result[0].prod_id;
            const oldData = JSON.parse(prod_id_array);
            console.log(oldData)
            console.log(removepid)
            console.log(prod_id_array)

            if (removepid == oldData[0]) {
                const {
                    productidget1 = 0,
                    productidget2 = oldData[1],
                    productidget3 = oldData[2],
                    productidget4 = oldData[3],
                } = req.body;


                function getProductInfo(productid) {

                    return new Promise((resolve, reject) => {
                        const sql = 'SELECT * FROM product WHERE id = ?';
                        c.query(sql, [productid], (error, result) => {
                            if (error) {
                                reject(error);
                            } else {
                                resolve(result.length ? result[0] : 0);
                            }
                        });
                    });
                }

                const products = Promise.all([
                    getProductInfo(productidget1),
                    getProductInfo(productidget2),
                    getProductInfo(productidget3),
                    getProductInfo(productidget4),
                ]);

                products
                    .then((productArray) => {

                        const prod_ids = productArray.map(product => product ? product.id : 0);
                        const team_ids = productArray.map(product => product ? product.team_id : 0);
                        const images = productArray.map(product => product ? product.image : 0);
                        const prodname = productArray.map(product => product ? product.sub_category : 0);


                        const prodid = JSON.stringify(prod_ids);

                        const teamid = JSON.stringify(team_ids);
                        const imagesJSON = JSON.stringify(images);
                        const prod_name = JSON.stringify(prodname);

                        const sql3 =
                            "UPDATE project SET prod_id = ?, team_id = ?, image = ? , prod_name = ? WHERE user_id = ?";
                        c.query(
                            sql3,
                            [prodid, teamid, imagesJSON, prod_name, id],
                            (error, result) => {
                                console.log(result);
                                if (error) {
                                    const response = {
                                        response: {
                                            msg: "0",
                                            result: "No Records!",
                                        },
                                    };
                                    res.send(response);
                                } else {
                                    const response = {
                                        response: {
                                            msg: "1",
                                            details: result
                                        },
                                    };

                                    res.send(response);
                                }
                            }
                        );

                    })
                    .catch((error) => {
                        console.error(error);
                    });


            }
            if (removepid == oldData[1]) {
                const {
                    productidget1 = oldData[0],
                    productidget2 = 0,
                    productidget3 = oldData[2],
                    productidget4 = oldData[3],
                } = req.body;


                function getProductInfo(productid) {

                    return new Promise((resolve, reject) => {
                        const sql = 'SELECT * FROM product WHERE id = ?';
                        c.query(sql, [productid], (error, result) => {
                            if (error) {
                                reject(error);
                            } else {
                                resolve(result.length ? result[0] : 0);
                            }
                        });
                    });
                }

                const products = Promise.all([
                    getProductInfo(productidget1),
                    getProductInfo(productidget2),
                    getProductInfo(productidget3),
                    getProductInfo(productidget4),
                ]);

                products
                    .then((productArray) => {

                        const prod_ids = productArray.map(product => product ? product.id : 0);
                        const team_ids = productArray.map(product => product ? product.team_id : 0);
                        const images = productArray.map(product => product ? product.image : 0);
                        const prodname = productArray.map(product => product ? product.sub_category : 0);


                        const prodid = JSON.stringify(prod_ids);

                        const teamid = JSON.stringify(team_ids);
                        const imagesJSON = JSON.stringify(images);
                        const prod_name = JSON.stringify(prodname);

                        const sql3 =
                            "UPDATE project SET prod_id = ?, team_id = ?, image = ? , prod_name = ? WHERE user_id = ?";
                        c.query(
                            sql3,
                            [prodid, teamid, imagesJSON, prod_name, id],
                            (error, updateResult) => {
                                if (error) {
                                    const response = {
                                        response: {
                                            msg: "0",
                                            result: "No Records!",
                                        },
                                    };
                                    res.send(response);
                                } else {
                                    const response = {
                                        response: {
                                            msg: "1",
                                            details: result
                                        },
                                    };

                                    res.send(response);
                                }
                            }
                        );

                    })
                    .catch((error) => {
                        console.error(error);
                    });
            }
            if (removepid == oldData[2]) {
                const {
                    productidget1 = oldData[0],
                    productidget2 = oldData[1],
                    productidget3 = 0,
                    productidget4 = oldData[3],
                } = req.body;


                function getProductInfo(productid) {

                    return new Promise((resolve, reject) => {
                        const sql = 'SELECT * FROM product WHERE id = ?';
                        c.query(sql, [productid], (error, result) => {
                            if (error) {
                                reject(error);
                            } else {
                                resolve(result.length ? result[0] : 0);
                            }
                        });
                    });
                }

                const products = Promise.all([
                    getProductInfo(productidget1),
                    getProductInfo(productidget2),
                    getProductInfo(productidget3),
                    getProductInfo(productidget4),
                ]);

                products
                    .then((productArray) => {

                        const prod_ids = productArray.map(product => product ? product.id : 0);
                        const team_ids = productArray.map(product => product ? product.team_id : 0);
                        const images = productArray.map(product => product ? product.image : 0);
                        const prodname = productArray.map(product => product ? product.sub_category : 0);


                        const prodid = JSON.stringify(prod_ids);

                        const teamid = JSON.stringify(team_ids);
                        const imagesJSON = JSON.stringify(images);
                        const prod_name = JSON.stringify(prodname);

                        const sql3 =
                            "UPDATE project SET prod_id = ?, team_id = ?, image = ? , prod_name = ? WHERE user_id = ?";
                        c.query(
                            sql3,
                            [prodid, teamid, imagesJSON, prod_name, id],
                            (error, updateResult) => {
                                if (error) {
                                    const response = {
                                        response: {
                                            msg: "0",
                                            result: "No Records!",
                                        },
                                    };
                                    res.send(response);
                                } else {
                                    const response = {
                                        response: {
                                            msg: "1",
                                            details: result
                                        },
                                    };

                                    res.send(response);
                                }
                            }
                        );

                    })
                    .catch((error) => {
                        console.error(error);
                    });
            }
            if (removepid == oldData[3]) {
                const {
                    productidget1 = oldData[0],
                    productidget2 = oldData[1],
                    productidget3 = oldData[2],
                    productidget4 = 0,
                } = req.body;


                function getProductInfo(productid) {

                    return new Promise((resolve, reject) => {
                        const sql = 'SELECT * FROM product WHERE id = ?';
                        c.query(sql, [productid], (error, result) => {
                            if (error) {
                                reject(error);
                            } else {
                                resolve(result.length ? result[0] : 0);
                            }
                        });
                    });
                }

                const products = Promise.all([
                    getProductInfo(productidget1),
                    getProductInfo(productidget2),
                    getProductInfo(productidget3),
                    getProductInfo(productidget4),
                ]);


                products
                    .then((productArray) => {

                        const prod_ids = productArray.map(product => product ? product.id : 0);
                        const team_ids = productArray.map(product => product ? product.team_id : 0);
                        const images = productArray.map(product => product ? product.image : 0);
                        const prodname = productArray.map(product => product ? product.sub_category : 0);


                        const prodid = JSON.stringify(prod_ids);

                        const teamid = JSON.stringify(team_ids);
                        const imagesJSON = JSON.stringify(images);
                        const prod_name = JSON.stringify(prodname);

                        const sql3 =
                            "UPDATE project SET prod_id = ?, team_id = ?, image = ? , prod_name = ? WHERE user_id = ?";
                        c.query(
                            sql3,
                            [prodid, teamid, imagesJSON, prod_name, id],
                            (error, updateResult) => {
                                if (error) {
                                    const response = {
                                        response: {
                                            msg: "0",
                                            result: "No Records!",
                                        },
                                    };
                                    res.send(response);
                                } else {
                                    const response = {
                                        response: {
                                            msg: "1",
                                            details: result
                                        },
                                    };

                                    res.send(response);
                                }
                            }
                        );

                    })
                    .catch((error) => {
                        console.error(error);
                    });
            }



        }


    })

}


)



// =============================================================project get==========================================


app.get('/projectget', (req, res) => {

    const id = req.query.id;
    const status = req.query.status;
    const payment_status = req.query.status;

    console.log("id " + id)




    const sql = 'select * from usertable where id =?'
    c.query(sql, [id], (error, result) => {
        if (error) {
            var details = {
                "status": "error"
            }

            res.send(details);


        }else if(result.length == 0){
            console.log('no one register')

        }
         else {

            const role = result[0].role_id
            if (role == "3") {
                const sql = 'select * from project where user_id =?';
                c.query(sql, [id], (error, result) => {

                    if (error) {
                        var details = {
                            "status": "error"
                        }
                        res.send(details);

                    } else {
                        res.send(result);
                    }
                })
            } else if (role == "1") {
                if (!status && !payment_status) {
                    const sql = 'select * from project'
                    c.query(sql, (error, result) => {
                        //console.log(result)

                        if (error) {
                            var details = {
                                "status": "Not able to view"
                            }
                            res.send(details);
                        }
                        else {

                            res.send(result);

                        }
                    })

                } else {
                    const sql = 'SELECT * FROM project WHERE status = ? OR payment_status = ?';
                    c.query(sql, [status, payment_status], (error, result) => {
                        //console.log(result)
                        if (error) {
                            var details = {
                                "status": "Not able to view"
                            }
                            res.send(details);
                        }
                        else {

                            res.send(result);
                        }
                    })

                }
            } else {
                var details = {
                    "status": "Not able to view"
                }
                res.send(details);

            }



        }
    })
})



// =======================================================project update===============================================

app.post('/projectUpdate', (req, res) => {

    const id = req.body.user_id
    const description = req.body.description
    const eventdate = req.body.date
    const venue = req.body.venue
    const estimatevalue = req.body.amountE
    const paymentsts = req.body.paymentstatus
    const status = req.body.status
    const amountpaid = req.body.amountpaid
    console.log('uema', id)
    console.log(status);
    console.log(estimatevalue);




    const sql = 'select * from project where user_id=?';
    c.query(sql, [id], (error, result) => {
        if (error) {
            res.status(500).json({ error: "Internal Server Error" });
        }else if(result ==''){
            const s={
                'sts':'not register'
            }

        } else {
            const projectid = result[0].id;
            console.log(projectid);
            if (!estimatevalue && !paymentsts && !status && !amountpaid ) {
                const projectid = result[0].id;
                console.log(eventdate)
                console.log(description)
                console.log(venue)

                const sql = 'UPDATE project SET description = ?, eventdate = ?, venue = ? WHERE id = ?';
                c.query(sql, [description, eventdate, venue, projectid], (error, result) => {
                    if (error) {
                        var detials = { 'status': 'fill all detials' }
                        res.send(detials)
                    } else {
                        var detials = { 'status': 'successfully update' }
                        res.send(detials)
                    }
                })

            } else {

                if (!paymentsts && !status && !amountpaid) {
                    // const projectid = req.body.id
                    const sql = 'UPDATE project SET estimated_value = ? WHERE id = ?';
                    c.query(sql, [estimatevalue, projectid], (error, result) => {
                        if (error) {
                            var detials = { 'status': 'error ' }
                            res.send(detials)
                        } else {
                            var detials = { 'status': 'successfully update estimate value ' }
                            res.send(detials)
                        }
                    })

                } else if (!estimatevalue && !status && !amountpaid) {
                    // const projectid = req.body.id
                    const sql = 'UPDATE project SET payment_status = ? WHERE id = ?';
                    c.query(sql, [paymentsts, projectid], (error, result) => {
                        if (error) {
                            var detials = { 'status': 'error ' }
                            res.send(detials)
                        } else {
                            var detials = { 'status': 'successfully update payment_status ' }
                            res.send(detials)
                        }
                    })

                } else if (!estimatevalue && !paymentsts && !amountpaid) {
                    // const projectid = req.body.id
                    const sql = 'UPDATE project SET status = ? WHERE id = ?';
                    c.query(sql, [status, projectid], (error, result) => {
                        if (error) {
                            var detials = { 'status': 'error ' }
                            res.send(detials)
                        } else {
                            var detials = { 'status': 'successfully update status ' }
                            res.send(detials)
                        }
                    })


                } else if (!estimatevalue && !paymentsts && !status) {
                    // const projectid = req.body.id
                    const sql = 'UPDATE project SET amount_paid = ? WHERE id = ?';
                    c.query(sql, [amountpaid, projectid], (error, result) => {
                        if (error) {
                            var detials = { 'status': 'error ' }
                            res.send(detials)
                        } else {
                            var detials = { 'status': 'successfully update amount paid' }
                            res.send(detials)
                        }
                    })

                }
                else {
                    var detials = { 'status': 'error ' }
                    res.send(detials)
                }
            }


        }
    });
}

);






// ================================================= PAYMENT INSERT=========================================

app.post('/payment', (req, res) => {

    const user_id = req.body.user_id;
    const tot_cost = req.body.total_cost;
    const paid_amount = req.body.paid_amount;
    const balance = req.body.balance_amount;
    const transactionid = req.body.transactionid;
    const date2 = new Date();
    console.log('user_id',user_id)
    console.log(tot_cost)
    console.log(paid_amount)
    console.log(transactionid)

    const sql = 'select * from project where user_id=?'
    c.query(sql, [user_id], (error, result) => {
        if (error) {
            const response = {
                response: {
                    message: '0',
                    result: 'error'
                }
            }
            res.send(response)
        } else {
            const project_id = result[0].id
            const sql = 'INSERT INTO payment (project_id, user_id, total_cost, paid_amount, trans_id, created_on,balance_amount) VALUES (?, ?, ?, ?, ?, ?,? )';
            c.query(sql, [project_id, user_id, tot_cost, paid_amount,transactionid, date2,balance], (error, result) => {
                if (error) {
                    const response = {
                        response: {
                            message: '0',
                            result: 'server error'
                        }
                    }
                    res.send(response)
                } else {
                    const response = {
                       'status':'success'
                    }
                    res.send(response)

                }
            })





        }
    })

}

)

// ===============================================================payemnt get===================================
app.get('/paymentget', (req, res) => {
    
    const sql = 'select * from payment'
    c.query(sql, (error, result) => {
        if (error) {
            var details = {
                "status": "Not able to view"
            }
            res.send(details);
        }
        else {
            res.send(result);
        }
    })

})

// =============================================================team table============================================

app.post('/teamtable', (req, res) => {
    const teamname = req.body.teamname;

    const date = new Date();
    console.log(date);


    const sql = 'insert into teamid(team_name,created_on)values(?,?)'
    c.query(sql, [teamname, date], (error, result) => {
        if (error) {
            const s = {
                status: "error"
            }
            return res.send(error);
        } else {
            const s = {
                status: "success"
            }
            return res.send(s);
        }
    })
})
// ===========================================================team get================================================
app.get('/teamtableget', (req, res) => {
    
    const sql = 'select * from teamid'
    c.query(sql, (error, result) => {
        if (error) {
            var details = {
                "status": "Not able to view"
            }
            res.send(details);
        }
        else {

            res.send(result);
        }
    })

})

// ======================================================teamallocation insert===================================

// app.post('/teamallocation', (req, res) => {

//     const projectid = req.body.project_id
//     const teamid = req.body.team_id;
//     const description = req.body.description;
//     const image = req.body.image;

//     const value = req.body.value;
//     const date = new Date();



//     const sql = 'insert into teamallocation(project_id,team_id ,description,image,value,created_on)values(?,?,?,?,?,?)'
//     c.query(sql, [projectid, teamid, description, image, value, date], (error, result) => {
//         if (error) {
//             const s = {
//                 status: "error"
//             }
//             return res.send(error);
//         } else {
//             const s = {
//                 status: "success"
//             }
//             return res.send(s);
//         }
//     })
// })
app.post('/teamallocation', (req, res) => {

    const project_id = req.body.project_id;
    const team_id = req.body.team_id;
    const description = req.body.description;

    const value = req.body.value;
    const status = req.body.status;
    const remarks = req.body.remarks;
    const date = new Date();

    const image = req.files.image;



    console.log(image);

    const allowedFormats = ['.jpg', '.jpeg', '.png'];
    const fileExtension = path.extname(image.name).toLowerCase();

    if (!allowedFormats.includes(fileExtension)) {

        const response = {
            response: {
                msg: '0',
                result: 'Only jpg, jpeg, and png formats are allowed',
            },
        };
        res.send(response);

    }

    const maxSize = 10 * 1000 * 1000;
    if (image.size > maxSize) {
        const response = {
            response: {
                msg: '0',
                result: 'Image size exceeds the maximum allowed (10MB)',
            },
        };
        res.send(response);

    }

    const uniqueFilename =
        Date.now() + "-" + fileExtension;

    const imageUrl = `/images/${uniqueFilename}`;
    console.log(imageUrl);

    image.mv(path.join(__dirname, "images", uniqueFilename), (err) => {
        if (err) {

            const response = {
                response: {
                    msg: '0',
                    result: 'Error uploading file',
                },
            };
            res.send(response);
        }


        const sql = 'insert into teamallocation( project_id, team_id, description, image, remarks, status, value, created_on)values(?,?,?,?,?,?,?,?)'
        c.query(sql, [project_id, team_id, description, imageUrl, remarks, status, value, date], (error, result) => {
            console.log(error)
            if (error) {
                const s = {
                    status: "error"
                }
                return res.send(error);
            } else {
                const s = {
                    status: "success"


                }
                console.log(s)
                return res.send(s);

            }
        })
    });
})
// ===================================================teamallocation update==================================

app.post('teamallocationup', (req, res) => {
    const id = req.body.id
    const remarks = req.body.remarks

    const sql = 'UPDATE teamallocation SET remarks = ? WHERE id = ?';
    c.query(sql, [remarks, id], (error, result) => {
        if (error) {
            const s = {
                status: "error"
            }
            return res.send(error);
        } else {
            const s = {
                status: "successfully  update ",
                id: id
            }
            return res.send(s);
        }

    })


})
// ==================================================team all get=============================================


app.get('/teamallocationget', (req, res) => {
    const id = req.query.id;

    const sql = 'select * from usertable where id = ?'
    c.query(sql,[id],(error,result)=>{
        if(error){
            const s={
                'status':'error'

            }
            res.send(s)
        }else if(result==''){
            console.log('empty result');
        }
        else{
            const teamid =result[0]. team_id

            const sql='select * from teamallocation where team_id=?  '
            c.query(sql,[teamid],(error,result)=>{
                if(error){
                    const s={
                        'status':'error'
        
                    }
                    res.send(s)
                }else{
                    res.send(result)

                }
            })

        }

    })


   

})
// ==============================
app.get('/teamallocationget',(req,res)=>{
    const sql='select * from teamallocation'
    c.query(sql,(error,result)=>{
       
        if(error){
            console.log('error')
        }else{
            const s={
                'status':'success',
                detail:result
            }
            res.send(s)
        }
    })
})




// ========================
