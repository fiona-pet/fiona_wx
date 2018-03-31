/**
 * Created by zhongfan on 2017/8/15.
 */
import Common from './Common'
import {
    getLookupList,
    getReferenceList,
    getPreUserList,
    getPreRoleList,
    getUserList,
    getLocationList,
    getFormsByCatalog,
    getAssetDetail,
    conditionExecute,
    findUserList,
    findRolesList,
    getPriority,
    getDynamicForm, getLookupItem
} from '../services/utilization'
import regularExpression from '../utils/regularExpression'
import {
    getTroubleTypeList,
    getClientIp
} from '../services/worksheet';
import DateUtil from '../utils/DateUtil'
import Auth from '../models/Auth'

export default {
    getPreUserList(pageIndex, query, success, failure) {
        Common.handlePage(getPreUserList(pageIndex, query), success, failure)
    },
    getPreRoleList(pageIndex, query, success, failure) {
        Common.handlePage(getPreRoleList(pageIndex,  query,), success, failure)
    },
    getLookupItem(type, name, pageIndex, query, success, failure) {
        Common.handlePage(getLookupItem(type, name, pageIndex, query), success, failure)
    },
    getLookupList(type, pageIndex, query, success, failure) {
        Common.handlePage(getLookupList(type, pageIndex,  query), success, failure)
    },
    getReferenceList(type, pageIndex, query, success, failure) {
        Common.handlePage(getReferenceList(type, pageIndex,  query), success, failure)
    },
    getPriority(type, pageIndex, query, success, failure) {
        Common.handlePage(getPriority(type, pageIndex,  query), success, failure)
    },
    getLocationList(success, failure) {
        Common.handlePage(getLocationList(), success, failure)
    },
    getUserList(success, failure) {
        Common.handlePage(getUserList(), success, failure)
    },
    getDirectory(success, failure) {
        getTroubleTypeList().then(res => {
            let obj = JSON.parse(res);
            let result = obj.result;
            if (result instanceof Array) {
                let list = [];
                result.map((item) => {
                    let parentId = item.id;
                    if (item.parent === undefined) {
                        list.push(item);
                        this.sortChild(list, result, parentId, 1);
                    }
                });
                success(result)
            } else {
                failure()
            }
        })
    },
    getDynamicForm(id, success) {
        getDynamicForm(id).then(res => {
            let obj = JSON.parse(res);
            let result = obj.result;
            let arr = [];
            if (result instanceof Array) {
                result.map(form => {
                    if(form.alias != 'kmTitleAndCatalog'){//根据别名去除知识库相关操作
                        arr.push(form.config);
                    }
                })
            }
            this.setComponentsInitValue(arr, {}, success)
        })
    },
    loadData(typeId, id, type, success){
        let result = {};
        getAssetDetail([typeId, id]).then(res => {
            let obj = JSON.parse(res);
            result = obj.result;
            return getFormsByCatalog(result.service_catalog.id, type, result)
        }).then(res => {
            let obj = JSON.parse(res);
            let componentsArr = obj.result;
            this.setComponentsInitValue(componentsArr, result, success)
        });
    },
    getFormsByCatalog(catalogId, type, result, success, failure) {
        getFormsByCatalog(catalogId, type, result).then(res => {
            let obj = JSON.parse(res);
            let componentsArr = obj.result;
            this.setComponentsInitValue(componentsArr, result, success, failure)
        });
    },
    setComponentsInitValue(componentsArr, result, success) {
        let promises = [];
        let components = [];
        let rules = [];
        let ciTypes = [];
        componentsArr.map(item => {
            if (item.hasOwnProperty("constructData")) {
                let constructData = JSON.parse(item.constructData);
                ciTypes.push(item.ci_type);
                rules.push(constructData.rules);
                components.push(constructData.components);
            }
        });
        console.log(components, rules)
        components.map(arr => {
            arr.map(component => {
                if (component.dataType === 'LOOKUP' && component.defaultValue) {
                    //TODO:待完善
                    this.getLookupItem(component.referenceType, component.defaultValue, 1, '', (res) => {
                        component.defaultValue = res.data[0].display_name
                    })
                }
                component.dataSource = [];
                if (regularExpression.hasOwnProperty(component.dataType)) {
                    component.validate.rules = [{pattern:regularExpression[component.dataType], message:component.label + "格式错误"}]
                }
                if (component.validate.required) {
                    component.required = component.validate.required
                }
                let value = result[component.name];
                if (component.editor == 'applyuser') {
                    component.defaultId = Auth.getId();
                    component.defaultValue = Auth.getUser().name;
                }
                if(component.editor === 'webip') {
                    if (value) {
                        component.defaultValue = value
                    }else {

                        let ipP = new Promise((resolve, reject) => {
                            getClientIp().then(res => {
                                resolve({res, component})
                            })
                        });

                        promises.push(ipP);
                    }
                }
                if (value) {
                    if(component.editor === 'datepicker') {
                        component.defaultValue = (new RegExp("^[0-9]*$")).test(value) ? DateUtil.dateToFormatString(value, "yyyy-MM-dd") : value;
                    }
                    if(component.editor === 'datetimepicker') {
                        component.defaultValue = value;
                    }
                    if(typeof(value) === "object") {
                        component.defaultValue = value.display_name;
                        component.defaultId = value.id;
                    }else {
                        component.defaultValue = value;
                    }
                    if(component.editor === 'webip') {
                        component.defaultValue = value
                    }
                    if (component.editor === 'userselector') {
                        let userP = new Promise((resolve, reject) => {
                            findUserList(value).then(res => {
                                resolve({res, component})
                            })
                        });
                        promises.push(userP);
                    }
                    if (component.editor === 'roleselector') {
                        let roleP = new Promise((resolve, reject) => {
                            findRolesList(value).then(res => {
                                resolve({res, component})
                            })
                        });
                        promises.push(roleP);
                    }
                }
            })
        });
        Promise.all(promises).then(results => {
            console.log(results)
            results.map(resultObj => {
                let obj = JSON.parse(resultObj.res);
                components.map(arr => {
                    arr.map(component => {
                        if (component.name === resultObj.component.name) {
                            if (component.editor === 'roleselector' || component.editor === 'userselector') {
                                let users = obj.result;
                                let a = [];
                                let b = [];
                                users.map(ress => {
                                    a.push(ress.display_name);
                                    b.push(ress.id);
                                });
                                component.defaultValue = a.join();
                                component.defaultId = b.join();
                            }
                            if (component.editor === 'webip') {
                                component.defaultValue = obj.result
                            }
                        }
                    })
                })
            });
            success(result, components, rules, ciTypes)
        });

        this.setComponentsRule(components, rules, result, ((ruledComponents) => {
            success(result, ruledComponents, rules, ciTypes)
        }));
    },
    getValuesById(typeId, id, success, failure) {
        getAssetDetail([typeId, id]).then(res => {
            let obj = JSON.parse(res);
            let result = obj.result;
            success(result)
        })
    },
    //*****************public*******************/
    loadLookUpData(showData, item, query, pageIndex, resolve, finish) {
        const pageFunction = (data, resIndex, totalPage) => {
            let allData = [];
            if (pageIndex == 1) {
                allData = data;
                resolve(allData, resIndex)
            }else if(pageIndex <= totalPage){
                allData = showData.concat(data);
                resolve(allData, resIndex)
            }else {
                finish()
            }
        };
        if (item.editor == "lookup" || item.editor == "radiogroup" || item.editor == 'checkbox' ) {
            this.getLookupList(item.referenceType, pageIndex, query, (result, resIndex, totalPage) => {
                pageFunction(result.data, resIndex, totalPage)
            })
        }
        if (item.editor == "reference" || item.editor == "applyuser") {
            if(item.name == "priority"){
                this.getPriority(item.reference, pageIndex, query, (result, resIndex, totalPage) => {
                    pageFunction(result.data, resIndex, totalPage)
                })
            }else{
                this.getReferenceList(item.reference, pageIndex, query, (result, resIndex, totalPage) => {
                    pageFunction(result.data, resIndex, totalPage)
                })
            }
        }
        if (item.editor == "userselector") {
            this.getPreUserList(pageIndex, query, (result, resIndex, totalPage) => {
                pageFunction(result.data, resIndex, totalPage)
            })
        }
        if (item.editor == "roleselector") {
            this.getPreRoleList(pageIndex, query, (result, resIndex, totalPage) => {
                pageFunction(result.data, resIndex, totalPage)
            })
        }
    },
    // 遍历回显值
    setComponentsValue(components, item, componentId) {
        components.map((arr) => {
            arr.map(component => {
                if (component.id == componentId) {
                    if(component.editor == "lookup" || component.editor == "radiogroup" ) {
                        component.defaultId = item.name;
                        component.defaultValue = item.display_name;
                    } else if (
                        component.editor == "reference" ||
                        component.editor == "applyuser" ||
                        component.editor == "userselector" ||
                        component.editor == "roleselector"
                    ) {
                        component.defaultId = item.id;
                        component.defaultValue = item.display_name;
                    } else if (component.editor == "checkbox" ){
                        component.defaultId = item.display_name;
                        component.defaultValue = item.display_name;
                    } else if (component.editor === 'registerpassword'){
                        if (item.name === component.name + 'first') {
                            component.first = item.value
                        } else {
                            component.second = item.value
                        }
                    } else {
                        component.value = item.value;
                        component.defaultValue = item.value;
                    }
                }
            })
        });
        return components
    },
    // 当某一个组件变化时应用规则
    changeComponentsRule(components, rules, ciTypes, componentName, orderId, success) {
        let [detailData, alarmNames] = this.mapExcuteData(components, ciTypes, orderId);
        let promises = [];
        rules.map(arr => {
            arr.map(rule => {
                let triggers = rule.triggers;
                if (rule.enable && triggers){
                    triggers.map(trigger => {
                        if (trigger == componentName) {

                            console.log("-------", rule, detailData)
                            let params = [detailData, rule.backendConditions.processor];

                            let p = new Promise((resolve, reject) => {
                                conditionExecute(params).then(res => {
                                    let obj = JSON.parse(res);
                                    let actionsConfig = rule.actionsConfig;
                                    let result = obj.result.result;
                                    console.log("bbbbbbb", result, rule)
                                    this.mapComponentsWithCondition(actionsConfig, result, components => {
                                        console.log("aaaaaa", components)
                                        resolve(components)
                                    });
                                });
                            });
                            promises.push(p)
                        }
                    });
                }
            })
        });
        this.handlePromises(promises, components, success)
    },
    // 设置所有规则
    setComponentsRule(components, rules, detailData, success) {
        let promises = [];
        rules.map(arr => {
            arr.map(rule => {
                let triggers = rule.triggers;
                if (rule.enable){
                    let params = [detailData, rule.backendConditions.processor];
                    let p = new Promise((resolve, reject) => {
                        conditionExecute(params).then(res => {
                            let obj = JSON.parse(res);
                            let actionsConfig = rule.actionsConfig;
                            let result = obj.result ? obj.result.result:false;
                            this.mapComponentsWithCondition(actionsConfig, result, components => {
                                resolve(components)
                            });
                        });
                    });
                    promises.push(p)
                }
            })
        });
        this.handlePromises(promises, components, success)
    },
    handlePromises(promises, components, success){
        let ps = []
        Promise.all(promises).then(arr => {
            arr.map(ruledComponents => {
                ruledComponents.map(ruledComponent => {
                    if (!ruledComponent) return;
                    components.map(arr => {
                        arr.map(component => {
                            if (component.name == ruledComponent.name) {
                                component.readonly = ruledComponent.readonly;
                                component.required = ruledComponent.required;
                                component.hidden = ruledComponent.hidden;
                                if (ruledComponent.value) {
                                    component.value = ruledComponent.value
                                }
                                if (ruledComponent.defaultId) {
                                    component.defaultId = ruledComponent.defaultId
                                }
                                if (ruledComponent.defaultValue) {
                                    component.defaultValue = ruledComponent.defaultValue
                                }
                                if (ruledComponent.scriptValue) {
                                    let p = new Promise((resolve, reject) => {
                                        this.processScript(component, ruledComponent.scriptValue, resolve)
                                    });
                                    ps.push(p)
                                }
                            }
                        })
                    })
                });
            });
            Promise.all(ps).then(scriptComponents => {
                scriptComponents.map(scriptComponent => {
                    if (!scriptComponent) return;
                    components.map(arr => {
                        arr.map(component => {
                            if (component.name == scriptComponent.name) {
                                component.readonly = scriptComponent.readonly;
                                component.required = scriptComponent.required;
                                component.hidden = scriptComponent.hidden;
                                if (scriptComponent.value) {
                                    component.value = scriptComponent.value
                                }
                                if (scriptComponent.defaultId) {
                                    component.defaultId = scriptComponent.defaultId
                                }
                                if (scriptComponent.defaultValue) {
                                    component.defaultValue = scriptComponent.defaultValue
                                }
                            }
                        })
                    })
                })
                success(components)
            });
        })
    },
    processScript(component, value, success) {
        if (component.editor === "lookup") {
            this.getLookupList(component.referenceType, this.pageIndex, "", (result, totalPage) => {
                this.setScript(component, result.data, value, success)
            })
        }else if (component.editor === "reference") {
            this.getReferenceList(component.reference, this.pageIndex, "", (result, totalPage) => {
                this.setScript(component, result.data, value, success)
            })
        }else if (component.editor === "userselector") {
            this.getPreUserList(this.pageIndex, "", (result, totalPage) => {
                this.setScript(component, result.data, value, success)
            })
        }else if (component.editor === "roleselector") {
            this.getPreRoleList(this.pageIndex, "", (result, resIndex, totalPage) => {
                this.setScript(component, result.data, value, success)
            })
        } else {
            success(component)
        }
    },
    setScript(component, arr, value, success) {
        arr.map(item => {
            if (item.name == value) {
                component.value = item.name;
                component.defaultValue = item.display_name;
            }
            if (item.id == value) {
                component.defaultId = item.id;
                component.defaultValue = item.display_name;
            }
        });
        success(component)
    },
    // 根据组件获取数据, /v2/workorder/condition/execute 接口报错，改如下
    mapExcuteData(arrs, ciTypes, orderId) {
        let alarmNames = [];
        let data = {};
        arrs.map((arr, index) => {
            data["id"] = orderId;
            data["type"] = ciTypes[index];
            arr.map(component => {
                // 顺序不能乱
                if(component.editor === 'datepicker') {
                    let timeString = component.defaultValue ? component.defaultValue.replace(new RegExp("-","gm"),"/"):"";
                    data[component.name] = (new RegExp("^[0-9]*$")).test(timeString) ? timeString : (new Date(timeString)).getTime();
                }else if(component.editor === 'datetimepicker') {
                    console.log(component)
                    let timeString = component.defaultValue ? (component.defaultValue + "").replace(new RegExp("-", "gm"), "/"):"";
                    let timeString1 = timeString.replace("T"," ");
                    data[component.name] = (new Date(timeString1)).getTime() ? (new Date(timeString1)).getTime() : timeString1;
                }else if (component.name == "source") {
                    data["source"] = 'wechat';
                }else if(component.hasOwnProperty("defaultId")){
                    data[component.name] = component.defaultId
                }else if(component.hasOwnProperty("value") || component.editor == "lookup"){
                    data[component.name] = component.value
                }else {
                    data[component.name] = component.defaultValue
                }

                if (component.editor === 'registerpassword') {
                    let first = component.first;
                    let second = component.second;
                    if (first !== second) {
                        alarmNames.push('两次输入密码不一致')
                    } else {
                        data[component.name] = component.first
                    }
                }

                if (component.required && !component.hidden && !data[component.name]) {
                    alarmNames.push("请填写" + component.label)
                }
                let value = data[component.name];
                if (value && component.validate.rules) {
                    let rules = component.validate.rules;
                    rules.map(rule => {
                        let patt1=new RegExp(rule.pattern);
                        if (!patt1.test(value)) {
                            alarmNames.push(rule.message)
                        }
                        if (component.validate.maxLength) {
                            if (value.length > component.validate.maxLength) {
                                alarmNames.push(component.label + "最大长度为" + component.validate.maxLength)
                            }
                        }
                        if(component.validate.max) {
                            if (value > component.validate.max) {
                                alarmNames.push(component.label + "最大值为" + component.validate.max)
                            }
                        }
                        if(component.validate.min) {
                            if (value < component.validate.min) {
                                alarmNames.push(component.label + "最小值为" + component.validate.min)
                            }
                        }
                    })
                }
            });
        });
        return [data, alarmNames]
    },
    // 根据组件获取数据
    mapData(arrs, ciTypes, orderId) {
        let dataArr = [];
        let alarmNames = [];
        arrs.map((arr, index) => {
            let data = {};
            data["id"] = orderId;
            data["type"] = ciTypes[index];
            arr.map(component => {
                // 顺序不能乱
                if(component.editor === 'datepicker') {
                    let timeString = component.defaultValue ? component.defaultValue.replace(new RegExp("-","gm"),"/"):"";
                    data[component.name] = (new RegExp("^[0-9]*$")).test(timeString) ? timeString : (new Date(timeString)).getTime();
                }else if(component.editor === 'datetimepicker') {
                    console.log(component)
                    let timeString = component.defaultValue ? (component.defaultValue + "").replace(new RegExp("-", "gm"), "/"):"";
                    let timeString1 = timeString.replace("T"," ");
                    data[component.name] = (new Date(timeString1)).getTime() ? (new Date(timeString1)).getTime() : timeString1;
                }else if (component.name == "source") {
                    data["source"] = 'wechat';
                }else if(component.hasOwnProperty("defaultId")){
                    data[component.name] = component.defaultId
                }else if(component.hasOwnProperty("value") || component.editor == "lookup"){
                    data[component.name] = component.value
                }else {
                    data[component.name] = component.defaultValue
                }
                console.log(component)

                if (component.editor === 'registerpassword') {
                    let first = component.first;
                    let second = component.second;
                    if (first !== second) {
                        alarmNames.push('两次输入密码不一致')
                    } else {
                        data[component.name] = component.first
                    }
                }

                if (component.required && !component.hidden && !data[component.name]) {
                    alarmNames.push("请填写" + component.label)
                }
                let value = data[component.name];
                if (value && component.validate.rules) {
                    let rules = component.validate.rules;
                    rules.map(rule => {
                        let patt1=new RegExp(rule.pattern);
                        if (!patt1.test(value)) {
                            alarmNames.push(rule.message)
                        }
                        if (component.validate.maxLength) {
                            if (value.length > component.validate.maxLength) {
                                alarmNames.push(component.label + "最大长度为" + component.validate.maxLength)
                            }
                        }
                        if(component.validate.max) {
                            if (value > component.validate.max) {
                                alarmNames.push(component.label + "最大值为" + component.validate.max)
                            }
                        }
                        if(component.validate.min) {
                            if (value < component.validate.min) {
                                alarmNames.push(component.label + "最小值为" + component.validate.min)
                            }
                        }
                    })
                }
            });
            if (JSON.stringify(data) != "{}") {
                dataArr.push(data)
            }
        });
        return [dataArr, alarmNames]
    },
    // 根据条件设置组件属性
    mapComponentsWithCondition(actionsConfig, result, success) {
        let promises = [];
        for (let property in actionsConfig) {
            let conditions = actionsConfig[property];
            conditions.map(condition => {
                if (condition.actionCondition == result) {
                    let component = {};
                    component.name = condition.formItemName;
                    component.readonly = condition.actions.changeAuthority.readonly;
                    component.required = condition.actions.changeValidator.required;
                    component.hidden = condition.actions.changeVisibility.hidden;
                    let p = new Promise((resolve, reject) => {
                        if (typeof(condition.actions.script) == "undefined") {
                            resolve(component)
                        }else {
                            let script = condition.actions.script;
                            let scriptMatch = script.match(/\'(\S*)\'/);
                            let value = scriptMatch ? scriptMatch[1] : '';
                            component.scriptValue = value;
                            resolve(component)
                        }
                    });
                    promises.push(p)
                }
            })
        }
        Promise.all(promises).then(ruledComponents => {
            success(ruledComponents)
        })
    },
    sortChild(list, result, parentId, count) {
        result.map((item, index) => {
            if (item.parent !== undefined) {
                if (item.parent === parentId) {
                    let i = 0;
                    let x = '';
                    while (i < count) {
                        x = x + "   ";
                        i++;
                    }
                    item.display_name = x + item.display_name;
                    list.push(item);
                    this.sortChild(list, result, item.id, count + 1);
                }
            }
        });
    }
}
