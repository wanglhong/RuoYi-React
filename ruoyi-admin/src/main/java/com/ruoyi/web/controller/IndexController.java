package com.ruoyi.web.controller;

import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

/**
 * SPA 前端路由兜底控制器
 */
@Controller
public class IndexController {

    private static final Logger log = LoggerFactory.getLogger(IndexController.class);

    /**
     * 匹配所有不包含 "." 的路径（即非静态资源）
     * 注意：必须覆盖单级、多级路由
     */
//    @GetMapping({
//            "/",
//            "/{path:^(?!api|static|assets|favicon\\.ico$)[^\\.]*}$",
//            "/{path:^(?!api|static|assets)[^\\.]*}/{subPath:[^\\.]*}",
//            "/{path:^(?!api|static|assets)[^\\.]*}/{subPath:[^\\.]*}/**"
//    })
    // 只匹配“看起来像前端路由”的路径：不含 . 且不是 API
    @GetMapping({
            "/",
            "/{x:[a-zA-Z0-9-_]+}",
            "/{x:[a-zA-Z0-9-_]+}/{y:[a-zA-Z0-9-_]+}",
            "/{x:[a-zA-Z0-9-_]+}/{y:[a-zA-Z0-9-_]+}/**"
    })
    public String spaFallback(HttpServletRequest request) {
        String requestURI = request.getRequestURI();
        log.warn("请求路径[{}]未匹配到任何静态资源，将返回 SPA 界面.", requestURI);
        return "forward:/index.html";
    }

}
