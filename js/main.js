(function () {
    const specInitWrapper = function (postPermalink, inCallback, outCallback) {
        const mount = function () {
            inCallback();

            let postContainer = document.querySelector(`[data-id="${postPermalink}"`);
            if (postContainer) {
                postContainer.style.height = '';
                postContainer.style.overflow = "";
            }

            window.addEventListener("LOCATION/PATHNAME_CHANGED", pathnameChangedHandler);
        };

        const waitPostDoscrollThenMount = function () {
            const currentPermalink = location.pathname.split('/')[location.pathname.split('/').length - 1];
            if (currentPermalink === postPermalink) {
                mount();
            } else {
                const pathnameChangedHandler = function (event) {
                    const pathname = event.detail.pathname;
                    const currentPermalink = pathname.split('/')[pathname.split('/').length - 1];
                    if (event.detail.isSynthetic && (currentPermalink === postPermalink)) {
                        window.removeEventListener("LOCATION/PATHNAME_CHANGED", pathnameChangedHandler);
                        mount();
                    } else if (!event.detail.isSynthetic) {
                        window.removeEventListener("LOCATION/PATHNAME_CHANGED", pathnameChangedHandler);
                    };
                };

                window.addEventListener("LOCATION/PATHNAME_CHANGED", pathnameChangedHandler);
            };
        };

        const pathnameChangedHandler = function (event) {
            const pathname = event.detail.pathname;
            const currentPermalink = pathname.split('/')[pathname.split('/').length - 1];
            if (currentPermalink !== postPermalink) {
                /* ушли из поста */
                window.removeEventListener("LOCATION/PATHNAME_CHANGED", pathnameChangedHandler);
                unmount(event);
            };
        };

        const unmount = function (event) {
            function watchScrollBack(event) {
                if (!event.detail.isSynthetic) {
                    /* ушли из инфинит скролла, можно больше не отслеживать возвращение в пост */
                    window.removeEventListener("LOCATION/PATHNAME_CHANGED", watchScrollBack);
                    return;
                };

                const pathname = event.detail.pathname;
                const currentPermalink = pathname.split('/')[pathname.split('/').length - 1];
                if (currentPermalink === postPermalink) {
                    /* возврат в пост – нужно заинитить всё заново */
                    mount();

                    window.removeEventListener("LOCATION/PATHNAME_CHANGED", watchScrollBack);
                };
            };

            if (event.detail.isSynthetic) {
                /* переход на следующий пост в инфинит скролле */
                /* нужно вручную отслеживать доскролл обратно */
                window.addEventListener("LOCATION/PATHNAME_CHANGED", watchScrollBack);
            };


            let postContainer = document.querySelector(`[data-id="${postPermalink}"`);

            if (postContainer) {
                postContainer.style.height = postContainer.offsetHeight + 'px';
                postContainer.style.overflow = "hidden";
            }

            outCallback();
        };

        const pageReadyHandler = function () {
            window.removeEventListener("LOCATION/PAGE_READY", pageReadyHandler);

            const currentPermalink = location.pathname.split('/')[location.pathname.split('/').length - 1];
            if (currentPermalink === postPermalink) {
                mount();
            } else {
                waitPostDoscrollThenMount();
            };
        };

        if (document.readyState === 'loading') {
            /* первый вариант, нативное выполнение js */
            /* навешиваем события */
            window.addEventListener("LOCATION/PAGE_READY", pageReadyHandler);
        } else {
            /* второй вариант, выполнение js через реакт */
            /* можно не ждать события, а сразу стартовать скрипты */
            waitPostDoscrollThenMount();
        };
    };

    const specPermalink = 'sanofi-1232'; //Обязательно не забыть проставить пермалинк, иначе код не заинится в посте
    //пермалинк берется из ссылки к посту, например: https://www.the-village.ru/people/specials/roscosmos-1271?unpublished=true&id=619953 – пермалинк тут "roscosmos-1271"

    const deviceType = {
        isMobile: () => window.innerWidth < 768,
        isTablet: () => (window.innerWidth >= 768) && (window.innerWidth < 1024),
        isDesktop: () => window.innerWidth >= 1024,
        isNotDesktop: () => window.innerWidth < 1024,
    };

    //установка и удаление ивент листнеров
    let configOfEventListeners = (function () {
        let arrOfEventsObj = [];

        return function (destroy, eventObj) {
            if (!destroy) {
                eventObj.target.addEventListener(eventObj.type, eventObj.func);

                arrOfEventsObj.push(eventObj);
            } else if (destroy == "current" && arrOfEventsObj.length != 0) {

                arrOfEventsObj.forEach((eventObjCopy) => {
                    let index = arrOfEventsObj.indexOf(eventObjCopy);

                    if (eventObj.type == eventObjCopy.type && eventObj.target == eventObjCopy.target && eventObj.func == eventObjCopy.func) {
                        eventObjCopy.target.removeEventListener(eventObjCopy.type, eventObjCopy.func);

                        arrOfEventsObj.splice(index, 1);
                    }
                });

            } else {
                arrOfEventsObj.forEach((eventObjCopy) => {
                    eventObjCopy.target.removeEventListener(eventObjCopy.type, eventObjCopy.func);
                });

                arrOfEventsObj = [];
            }
        };
    })();
    //**OVER**

    const initPostJs = function () {
        //Cтандартные настройки спецов
        let appContainer = document.querySelector('[data-id="danone-1247"] [data-ui-id="post"]');
        let scrollPercentage = [25, 50, 75, 100];
        document.body.setAttribute('id', specPermalink);

        appContainer ? configOfEventListeners(false, { target: window, type: "scroll", func: whereSrollNow }) : false;
        //END



        //ТВОЙ КОД JS ТУТ
        //Тебе доступны такие сущности: 
        //deviceType
        //deviceType.isMobile() – определение мобильной версии
        //deviceType.isTablet() – определение планшетной версии
        //deviceType.isDesktop() – определение десктопной версии
        //deviceType.isNotDesktop() – определение не десктопной версии версии

        //gaPushEvent("экшн_события", "категория_события", "описание_события", "не_взаимодействие_со_страницей?")

        //configOfEventListeners – addEventLister / removeEventListener
        //configOfEventListeners(false, {target: таргет_события, type: "вид_события", func: название_функции_хэндлера_события}) – установка ивентлистнера
        //configOfEventListeners("current", {target: таргет_события, type: "вид_события", func: название_функции_хэндлера_события}) – ремуваем прослушивание конкретного событие с элемента
        //configOfEventListeners(true, true) – удаляем все повешанные ивент_листнеры



        // start
        let variant = document.querySelectorAll('.list__li');
        let post__content = document.querySelector('.content');

        let countOfAnswer = 0;

        variant.forEach((e) => {
            configOfEventListeners(false, { target: e, type: "click", func: showAnswer })
        });

        function showAnswer(e) {
            let target = e.currentTarget;

        }

        variant.forEach((item) => {
            configOfEventListeners(false, { target: item, type: "click", func: changeQuestion });
        });

        function changeQuestion(e) {
            let target = e.currentTarget;

            post__content.classList.add("transition");

            setTimeout(() => {

                if (post__content.dataset.question >= variant.length - 28) {
                    post__content.dataset.question = 0;
                    countOfAnswer = 0;
                } else {
                    post__content.dataset.question = ++countOfAnswer;
                }

                post__content.classList.remove("transition");
            }, 800);

            // console.log(variant);
        }


        //кнопки с ответами
        let total = document.querySelectorAll('.list__li');
        arr = [];
        //при кэике на кноку
        total.forEach((e) => {
            configOfEventListeners(false, { target: e, type: "click", func: addAnswer })
        });
        // с помощью функции забираем дата атрибут кнопки и кэадем в массив
        function addAnswer(e) {
            let selectedAnswer = e.currentTarget.dataset.result;
            arr.push(selectedAnswer);
        };

        function checkResult(){
            let count_1 = 0, count_2 = 0, count_3 = 0, count_4 = 0;
            arr.forEach((item) => {
          
              if(item == "0"){
               count_1++;
              } else if(item == "1"){
               count_2++;
              } else if(item == "2"){
               count_3++;
              } else if(item == "3"){
             count_4++;
              }
            });
          
            if(count_1 > count_2 && count_1 > count_3 && count_1 > count_4){ //Если первый ответ больше, то возвращаем победивший индекс 0
             return 0;
            } else if(count_2 > count_1 && count_2 > count_3 && count_2 > count_4){  //Если вторых ответов больше, то возвращаем победивший индекс 1
             return 1;
            } else if(count_3 > count_1 && count_3 > count_2 && count_3 > count_4){  //Если третьих ответов больше, то возвращаем победивший индекс 2
             return 2;
            } else if(count_4 > count_1 && count_4 > count_2 && count_4 > count_3){  //Если четвертых ответов больше, то возвращаем победивший индекс 3
             return 3;
            } else {  //Если равное значение ответов или еще что-то то возращаем 3 ответ 
             return 3;
            }
          }

          console.log(arr);
        // var scenes = document.querySelectorAll('.parallax__item');
        // scenes.forEach((item) => {
        //     new Parallax(item);
        //     deviceType.isMobile();
        // });
        // var villa = document.querySelectorAll('.parallax__item2');
        // villa.forEach((item) => {
        //     new Parallax(item, {

        //     });


        //     deviceType.isMobile();
        // });



        AOS.init();


        //END





        //Вспомогательные функции спецов
        function whereSrollNow() { // Пуш события проскролла страницы в ГА
            scrollPercentage.forEach((percent) => {
                let index = scrollPercentage.indexOf(percent);

                if (((pageYOffset + window.innerHeight) > (appContainer.offsetHeight * (percent / 100))) && (!appContainer.classList.contains("'scroll_" + percent + "'"))) {
                    appContainer.classList.add("'scroll_" + percent + "'");

                    gaPushEvent("scroll", "user offscroll " + percent + "%", "Пользователь проскролил " + percent + "% поста", true);


                    if (index == (scrollPercentage.length - 1)) {
                        configOfEventListeners("current", { target: window, type: "scroll", func: whereSrollNow });
                    }
                }
            });
        }


        //Функция отправки событий в GA
        function gaPushEvent(action, category, label, nonInteraction) {
            let event = nonInteraction ? "eventWithNonInteraction" : "event";

            window['dataLayer'] ? window.dataLayer.push({ 'event': event, 'eventCategory': category, 'eventAction': action, 'eventLabel': label }) : console.log(action, category, label, nonInteraction);
        }
        //END
    }


    const destroyEventListeners = function () {
        /* прежде чем удалить id спеца нужно проверить, он ли вообще стоит */
        /* чтобы случайно не затереть id следующего спеца */
        if (document.querySelector("body").id === specPermalink) {
            configOfEventListeners(true, true);

            document.querySelector("body").removeAttribute('id');
        };

        /* чистим всё */
    };

    window.location.host.includes("the-village.ru") ? specInitWrapper(specPermalink, initPostJs, destroyEventListeners) : window.addEventListener("load", initPostJs);
})();