

/*********
**边栏显示
*********/
var slidebars = function () {

	/**
	 * 启动
	 */

	// 缓存所有的元素
	var canvas = $( '[canvas]' ),

	// 初始化边栏
	offCanvas = {},

	// 变量
	initialized = false,
	registered = false,
	sides = [ 'top', 'right', 'bottom', 'left' ],
	styles = [ 'reveal', 'push', 'overlay' ],

	// 方法
	registerSlidebar = function ( id, side, style, element ) {
		// 检查是否已经存在边栏
		if ( offCanvas.hasOwnProperty( id ) ) {
			throw "已经存在'" + id + "'";
		}

		// 注册边栏信息
		offCanvas[ id ] = {
			'id': id,
			'side': side,
			'style': style,
			'element': element,
			'active': false
		};
	},
	getAnimationProperties = function ( id ) {
		// 设置变量
		var elements = $(),
		amount = '0px, 0px',
		duration = parseFloat( offCanvas[ id ].element.css( 'transitionDuration' ), 10 ) * 1000;

		// 元素动画
		if ( offCanvas[ id ].style === 'reveal' || offCanvas[ id ].style === 'push' ) {
			elements = elements.add( canvas );
		}

		if ( offCanvas[ id ].style === 'push' || offCanvas[ id ].style === 'overlay' ) {
			elements = elements.add( offCanvas[ id ].element );
		}

		// 动画的幅度大小
		if ( offCanvas[ id ].active ) {
			if ( offCanvas[ id ].side === 'top' ) {
				amount = '0px, ' + offCanvas[ id ].element.css( 'height' );
			} else if ( offCanvas[ id ].side === 'right' ) {
				amount = '-' + offCanvas[ id ].element.css( 'width' ) + ', 0px';
			} else if ( offCanvas[ id ].side === 'bottom' ) {
				amount = '0px, -' + offCanvas[ id ].element.css( 'height' );
			} else if ( offCanvas[ id ].side === 'left' ) {
				amount = offCanvas[ id ].element.css( 'width' ) + ', 0px';
			}
		}

		// 返回动画属性
		return { 'elements': elements, 'amount': amount, 'duration': duration };
	};

	/**
	 * 初始化
	 */

	this.init = function ( callback ) {
		// 检测边栏是否已经初始化
		if ( initialized ) {
			throw '你已经初始化过边栏';
		}

		// 循环注册边栏
		if ( ! registered ) {
			$( '[off-canvas]' ).each( function () {
				// 获取边栏的参数
				var parameters = $( this ).attr( 'off-canvas' ).split( ' ', 3 );

				// 确保有有效的参数
				if ( parameters[ 0 ] && sides.indexOf( parameters[ 1 ] ) !== -1 && styles.indexOf( parameters[ 2 ] ) !== -1 ) {
					// 注册
					registerSlidebar( parameters[ 0 ], parameters[ 1 ], parameters[ 2 ], $( this ) );
				} else {
					throw "注册错误";
				}
			} );

			// 注册成功
			registered = true;
		}

		// 设置初始化成功
		initialized = true;

		// 设置CSS样式
		this.css();

		// 触发器事件，触发Init函数
		$( events ).trigger( 'init' );

		// 回调函数
		if ( typeof callback === 'function' ) {
			callback();
		}
	};

	/**
	 * 退出
	 */
	this.exit = function ( callback ) {
		// 检测是否初始化
		if ( ! initialized ) {
			throw '你需要先进行侧栏的初始化工作';
		}

		// 退出函数
		var exit = function () {
			// 设置未初始化
			initialized = false;

			// 触发退出事件
			$( events ).trigger( 'exit' );

			// 回调函数
			if ( typeof callback === 'function' ) {
				callback();
			}
		};

		// 如果侧边是打开的那么关闭
		if ( this.active( 'slidebar' ) ) {
			this.close( exit );
		} else {
			exit();
		}
	};

	/**
	 * CSS
	 */

	this.css = function ( callback ) {
		// 检测是否初始化
		if ( ! initialized ) {
			throw '你需要先进行侧栏的初始化工作';
		}

		// 循环查看侧栏，检测边距
		for ( var id in offCanvas ) {
			// 检测侧栏是否含有该ID
			if ( offCanvas.hasOwnProperty( id ) ) {
				// 计算偏移量
				var offset;

				if ( offCanvas[ id ].side === 'top' || offCanvas[ id ].side === 'bottom' ) {
					offset = offCanvas[ id ].element.css( 'height' );
				} else {
					offset = offCanvas[ id ].element.css( 'width' );
				}

				if ( offCanvas[ id ].style === 'push' || offCanvas[ id ].style === 'overlay' ) {
					offCanvas[ id ].element.css( 'margin-' + offCanvas[ id ].side, '-' + offset );
				}
			}
		}

		// 打开侧栏
		if ( this.active( 'slidebar' ) ) {
			this.open( this.active( 'slidebar' ) );
		}

		// 触发事件
		$( events ).trigger( 'css' );

		// 回调函数
		if ( typeof callback === 'function' ) {
			callback();
		}
	};

	/**
	 * 控件
	 */

	this.open = function ( id, callback ) {
		// 检测是否初始化
		if ( ! initialized ) {
			throw '你需要先进行侧栏的初始化工作';
		}

		// 若ID不存在
		if ( ! id ) {
			throw "打开侧栏错误，ID号不存在";
		}

		// 检测侧栏是否存在
		if ( ! offCanvas.hasOwnProperty( id ) ) {
			throw "侧栏未打开 '" + id + "'.";
		}

		// 打开侧栏
		var open = function () {
			// 设置该ID的侧栏已经激活
			offCanvas[ id ].active = true;

			// 显示侧栏
			offCanvas[ id ].element.css( 'display', 'block' );

			// 触发事件
			$( events ).trigger( 'opening', [ offCanvas[ id ].id ] );

			// 获取动画的属性
			var animationProperties = getAnimationProperties( id );

			// 应用CSS样式
			animationProperties.elements.css( {
				'transition-duration': animationProperties.duration + 'ms',
				'transform': 'translate(' + animationProperties.amount + ')'
			} );

			// 移动完毕后
			setTimeout( function () {
				// 触发事件
				$( events ).trigger( 'opened', [ offCanvas[ id ].id ] );

				// 回调函数
				if ( typeof callback === 'function' ) {
					callback();
				}
			}, animationProperties.duration );
		};

		// 如果该ID已经激活，那么打开边栏
		if ( this.active( 'slidebar' ) && this.active( 'slidebar' ) !== id ) {
			this.close( open );
		} else {
			open();
		}
	};

	this.close = function ( id, callback ) {

		if ( typeof id === 'function' ) {
			callback = id;
			id = null;
		}

		//检测边栏是否初始化
		if ( ! initialized ) {
			throw '你需要先进行初始化';
		}

		// 检测边栏是否存在
		if ( id && ! offCanvas.hasOwnProperty( id ) ) {
			throw "不存在该边栏'" + id + "'.";
		}

		// 若没有ID，检测是否边栏有打开的
		if ( ! id ) {
			// 寻找边栏中激活的
			for ( var key in offCanvas ) {
				// 检测是否有ID
				if ( offCanvas.hasOwnProperty( key ) ) {
					// 若已经激活，则设置	ID
					if ( offCanvas[ key ].active ) {
						id = key;
						break;
					}
				}
			}
		}

		// 关闭边栏
		if ( id && offCanvas[ id ].active ) {
			// 设置激活状态为FALSE
			offCanvas[ id ].active = false;

			// 触发事件：关闭该Id的边栏
			$( events ).trigger( 'closing', [ offCanvas[ id ].id ] );

			// 获取动画属性
			var animationProperties = getAnimationProperties( id );

			// 应用CSS样式
			animationProperties.elements.css( 'transform', '' );

			// 移动效果结束后
			setTimeout( function () {
				// 移除过渡效果属性
				animationProperties.elements.css( 'transition-duration', '' );

				// 隐藏边栏
				offCanvas[ id ].element.css( 'display', 'none' );

				// 触发关闭事件
				$( events ).trigger( 'closed', [ offCanvas[ id ].id ] );

				// 回调函数
				if ( typeof callback === 'function' ) {
					callback();
				}
			}, animationProperties.duration );
		}
	};

	this.toggle = function ( id, callback ) {
		// 检测边栏是否初始化
		if ( ! initialized ) {
			throw '请先初始化边栏';
		}

		//若没有ID
		if ( ! id ) {
			throw "没有ID";
		}

		// 检测边栏是否存在
		if ( ! offCanvas.hasOwnProperty( id ) ) {
			throw "不存在该边栏 '" + id + "'.";
		}

		// 检测状态
		if ( offCanvas[ id ].active ) {
			// 如果已经打开，则关闭
			this.close( id, function () {
				// 回调函数
				if ( typeof callback === 'function' ) {
					callback();
				}
			} );
		} else {
			// 若关闭，则打开
			this.open( id, function () {
				//回调
				if ( typeof callback === 'function' ) {
					callback();
				}
			} );
		}
	};

	/**
	 * 激活
	 */

	this.active = function ( query, callback ) {
		
		if ( typeof query === 'function' ) {
			callback = query;
			query = null;
		}

		// 设置未激活
		var active = false;

		//检测初始化
		if ( ! query ) {
			active = initialized;
		} else

		// 检测所有边栏
		if ( query === 'slidebar' ) {
			//检测所有边栏是否初始化
			if ( ! initialized ) {
				throw '边栏需要先进行初始化操作';
			}

			// 遍历边栏
			for ( var id in offCanvas ) {
				// 检测侧栏是否含有该ID
				if ( offCanvas.hasOwnProperty( id ) ) {
					// 若已经激活，则设置ID
					if ( offCanvas[ id ].active ) {
						active = offCanvas[ id ].id;
						break;
					}
				}
			}
		} else

		//检测ID
		{
			// 检测是否初始化
			if ( ! initialized ) {
					throw '边栏需要先进行初始化操作';
			}

			//检测边栏是否存在
			if ( ! offCanvas.hasOwnProperty( query ) ) {
				throw "不存在该边栏 '" + query + "'.";
			}

			// 设置激活状态
			active = offCanvas[ query ].active;
		}

		// 回调
		if ( typeof callback === 'function' ) {
			callback();
		}

		// 返回激活状态
		return active;
	};

	/**
	 * 管理
	 */

	this.create = function ( id, side, style, content, callback ) {

		if ( typeof content === 'function' ) {
			callback = content;
			content = null;
		}

			// 检测是否初始化
			if ( ! initialized ) {
					throw '边栏需要先进行初始化操作';
			}


		if ( id && sides.indexOf( side ) !== -1 && styles.indexOf( style ) !== -1 ) {

			if ( offCanvas.hasOwnProperty( id ) ) {
				throw "Error attempting to create Slidebar, a Slidebar with ID '" + id + "' already exists.";
			}

			//创建元素
			$( '<div id="' + id + '" off-canvas="' + id + ' ' + side + ' ' + style + '"></div>' ).appendTo( 'body' );

			//添加边栏
			if ( content ) {
				$( '#' + id ).html( content );
			}

			// 注册边栏
			registerSlidebar( id, side, style, $( '#' + id ) );

			// 重置CSS样式
			this.css();

			// 触发事件
			$( events ).trigger( 'created', [ offCanvas[ id ].id ] );

			// 回调
			if ( typeof callback === 'function' ) {
				callback();
			}
		} else {
			throw "错误";
		}
	};

	this.destroy = function ( id, callback ) {
		// 检测是否初始化
			if ( ! initialized ) {
					throw '边栏需要先进行初始化操作';
			}

		// 若没有ID
		if ( ! id ) {
			throw "无ID";
		}

		// 检测边栏是否存在
		if ( ! offCanvas.hasOwnProperty( id ) ) {
			throw "不存在边栏 '" + id + "'.";
		}

		// 删除
		var destroy = function () {
			// 触发删除ID事件
			$( events ).trigger( 'destroyed', [ offCanvas[ id ].id ] );

			// 移除该元素
			offCanvas[ id ].element.remove();

			//移除该ID的OFFCANVAS布局
			delete offCanvas[ id ];

			// 回调
			if ( typeof callback === 'function' ) {
				callback();
			}
		};

		// 若激活则删除并关闭
		if ( offCanvas[ id ].active ) {
			this.close( id, destroy );
		} else {
			destroy();
		}
	};

	/**
	 * 事件
	 */

	// 公共事件
	this.events = {};

	// Private
	var events = this.events;

	/**
	 * 重置大小
	 */

	window.onresize = this.css.bind( this );
};

/************
*显示聊天信息
************/

//读取信息
function loadChatInfo(data,right)
{
    //数据存在
    if(data)
    {
        //获取显示聊天信息的层
        var $rootDiv = $("#chat-messages");
        var msgDiv = $("<div>");
        
        if (right) {
            msgDiv.addClass("message right");
        }
        else { msgDiv.addClass("message"); }

        msgDiv.appendTo($rootDiv);

        //添加头像和个人信息    
        var UserImg = $("<img>");
        UserImg.attr("src", data.imgSrc);
        UserImg.appendTo(msgDiv);
        
        var UserInfo = $("<div>");
        UserInfo.addClass("bubble");
		UserInfo.text(data.userInfo)
        UserInfo.appendTo(msgDiv);
		
		var Corner=$("<div>");
		Corner.addClass("corner");
		Corner.appendTo(UserInfo);


        //var ChatPublishTime = $("<span>");
        
        ////显示发表的时间
        ////var PublishTime = new Date();
        ////var _pbTime = PublishTime.toLocaleString();
        //ChatPublishTime.text("Now");
        //ChatPublishTime.appendTo(UserInfo);
    }
}



